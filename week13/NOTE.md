# 每周总结可以写在这里

## Proxy 是什么？

> Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）。

roxy 是提供给开发人员一个及其接近浏览器底层的 API。在没有 Proxy 之前，是无法改变原生 JS 特性的。Proxy 一共提供了 13 种修改原生特性的能力。

```javascript
let target = {
  a: 1,
};

let proxy = new Proxy(target, {
  set(target, key, value, receiver) {
    console.log(key);
    return Reflect.set(target, key, value, receiver);
  },
});
```

Proxy 第一个参数是目标对象，第二个参数是一个对象，其属性是当执行一个操作时定义代理的行为的函数。这时可以在第二个参数中加入一个 set 方法，这时可以监听到是哪个 key 做了改变。并且通过 Reflect 的 set 方法去模拟真实的 set 方法。[MDN]()

## 为什么说 Proxy 的性能比 Object.defineProperty 更好

### Object.defineProperty 只能监听属性，而 Proxy 能监听整个对象，省去对非对象或数组类型的劫持，也能做到监听。

vue3.0 之前通过对对象的每一个属性进行 Object.defineProperty 去 watch 它

```javascript
/**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

Proxy 不用再去遍历所有属性进行劫持了，这样就省去了遍历元素。

```javascript
let target = {
  a: 1,
  b: 2,
  c: 3,
};

let proxy = new Proxy(target, {
  set(target, key, value, receiver) {
    console.log('检测到了set的key为 -> ' + key);
    return Reflect.set(target, key, value, receiver);
  },
});

proxy.a = '1'; // 检测到了set的key为 -> a
proxy.b = '2'; // 检测到了set的key为 -> b
proxy.c = '3'; // 检测到了set的key为 -> c
```

### Object.defineProperty 不能监测到数组变化

Vue 中对于数组这么操作：

```javascript
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
];

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.slice(2);
        break;
    }
    if (inserted) ob.observeArray(inserted);
    // notify change
    ob.dep.notify();
    return result;
  });
});
```

这里就是 Array 的原生方法进行重写，包括 push、pop、shift、unshift、splice、sort、reverse。虽然改写了方法，但是通过下标的方式，还是无法被监测到，用 Object.defineProperty 是无法实现的。但是 Proxy 可以.

```javascript
let target = [1, 2, 3];

let proxy = new Proxy(target, {
  set(target, key, value, receiver) {
    console.log('检测到了set的key为 -> ' + key);
    return Reflect.set(target, key, value, receiver);
  },
});

proxy[0] = '1'; // 检测到了set的key为 -> 0
proxy.push('2'); // 检测到了set的key为 -> 3  检测到了set的key为 -> length
proxy.pop(); // 检测到了set的key为 -> length
```

### 用 Proxy 实现 Vue 的数据劫持

完成数据劫持的主要思路就是将传入的对象，以及对象内部去递归的全部改为 Proxy 代理。

```javascript
function isArray(o) {
  return Object.prototype.toString.call(o) === `[object Array]`;
}

function isObject(o) {
  return Object.prototype.toString.call(o) === `[object Object]`;
}

class Observables {
  constructor(
    target,
    handler = {
      set(target, key, value, receiver) {
        console.log('检测到了set的key为 -> ' + key);
        return Reflect.set(target, key, value, receiver);
      },
    }
  ) {
    if (!isObject(target) && !isArray(target)) {
      throw new TypeError('target 不是数组或对象');
    }

    this._target = JSON.parse(JSON.stringify(target)); // 避免引用修改  数组不考虑
    this._handler = handler;

    return new Proxy(this._observables(this._target), this._handler);
  }
  // 为每一项为Array或者Object类型数据变为代理
  _observables(target) {
    // 遍历对象中的每一项
    for (const key in target) {
      // 如果对象为Object或者Array
      if (isObject(target[key]) || isArray(target[key])) {
        // 递归遍历
        this._observables(target[key]);
        // 转为Proxy
        target[key] = new Proxy(target[key], this._handler);
      }
    }
    // 将转换好的target返回出去
    return target;
  }
}
// 这里具体调用看一下效果
const o = {
  a: [1, 2],
  c: {
    a: 1,
    b: 2,
    c: [
      [
        1,
        2,
        {
          d: 3,
        },
      ],
    ],
  },
  b: 2,
};

const ob = new Observables(o);
ob.a.push(3); // 检测到了set的key为 -> 2 检测到了set的key为 -> length
ob.c.a = 2; // 检测到了set的key为 -> a
ob.c.c[0][2].d = 6; // 检测到了set的key为 -> d
ob.b = 44; // 检测到了set的key为 -> b
```

可以看到可以看到 push 和下标都是可以监测到的。
