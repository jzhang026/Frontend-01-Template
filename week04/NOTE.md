# 每周总结可以写在这里

# W04-Geek-FE

```objective-c
#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // var context = new JSContext
        JSContext* context = [[JSContext alloc] init];
        JSValue* result;
        while (true) {
            
            char sourcecode[1024];
            
            scanf("%s", sourcecode);
            NSString* code = [NSString stringWithUTF8String:sourcecode];
            
            // context.evaluateScript('')
            result = [context evaluateScript:code];
        
            // console.log(result.toString());
            NSLog(@"%@", [result toString]);
        }
    }
    return 0;
}
```

```objective-c
#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // var context = new JSContext
        JSContext* context = [[JSContext alloc] init];
        JSValue* result;
        NSString* code = @"(function(x) { return x * x; })";
        
        // context.evaluateScript('')
        result = [context evaluateScript:code];
        
        [result callWithArguments:@[]];
        
        JSValue* arg1 = [JSValue valueWithInt32:12 inContext:context];
    
        // console.log(result.toString());
        NSLog(@"%@", [[result callWithArguments:@[arg1]] toString]);
    }
    return 0;
}
```

```objective-c
#import <Foundation/Foundation.h>
#import <JavaScriptCore/JavaScriptCore.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        // var context = new JSContext
        JSContext* context = [[JSContext alloc] init];
        JSValue* result;
        NSString* code = @"new Promise(resolve => resolve()).then(() => this.a = 3), function() {return this.a}";
        
        // context.evaluateScript('')
        result = [context evaluateScript:code];
        
        // [result callWithArguments:@[]];
    
        // console.log(result.toString());
        NSLog(@"%@", [[result callWithArguments:@[]] toString]);
    }
    return 0;
}

```



其实所有的JS代码都是一个微任务，只是哪些微任务构成了一个宏任务；执行在JS引擎里的就是微任务，执行在JS引擎之外的就是宏任务，循环宏任务的工作就是事件循环。

resolve的执行，产生了一个额外的微任务，添加在微任务队列的最后。



> 拿浏览器举例：setTimeout、setInterval 这种其实不是 JS 语法本身的 API，是 JS 的宿主浏览器提供的 API， 所以是宏任务。
> 而 Promise 是 JS 本身自带的 API，这种就是微任务。
>
> 总结：宿主提供的方法是宏任务，JS 自带的是微任务

### 事件循环是什么？

事件循环是浏览器执行任务的机制，它会不断循环判断消息队列中是否有任务，队列中的任务都是指宏任务，而宏任务中包含微任务队列，在宏任务结束前后执行微任务队列，知道微任务队列中为空才结束这个宏任务。
### 宏任务
- 渲染事件（如解析 DOM、计算布局、绘制）；
- 用户交互事件（如鼠标点击、滚动页面、放大缩小等）；
- JavaScript 脚本执行事件；网络请求完成、文件读写完成事件。
为了协调这些任务有条不紊地在主线程上执行，页面进程引入了消息队列和事件循环机制，渲染进程内部会维护多个消息队列，比如延迟执行队列和普通的消息队列。然后主线程采用一个 for 循环，不断地从这些任务队列中取出任务并执行任务。我们把这些消息队列中的任务称为宏任务。
### 微任务
微任务就是一个需要异步执行的函数，执行时机是在主函数执行结束之后、当前宏任务结束之前。
- 微任务和宏任务是绑定的，每个宏任务在执行时，会创建自己的微任务队列。
- 微任务的执行时长会影响到当前宏任务的时长。比如一个宏任务在执行过程中，产生了 100 个微任务，执行每个微任务的时间是 10 毫秒，那么执行这 100 个微任务的时间就是 1000 毫秒，也可以说这 100 个微任务让宏任务的执行时间延长了 1000 毫秒。所以你在写代码的时候一定要注意控制微任务的执行时长。
- 在一个宏任务中，分别创建一个用于回调的宏任务和微任务，无论什么情况下，微任务都早于宏任务执行。

### 举例

```javascript
async function afoo(){
    console.log("1");
    await new Promise(resolve => resolve());
    console.log("2");
}

new Promise(resolve => (console.log("3"), resolve()))
    .then(()=>(
        console.log("4"), 
        new Promise(resolve => resolve())
            .then(() => console.log("5")) ));

setTimeout(function(){
    console.log("6");
    new Promise(resolve => resolve()) .then(console.log("7"));
}, 0);
console.log("8");
console.log("9");
afoo();

// 3
// 8
// 9
// 1
// 4
// 2
// 5
// 6
// 7
```

解析：
* 第一个宏任务：
    * 3
        * 入队 4
    * 8
    * 9
    * 1
        * 入队 2
    * 4
        * 入队 5
    * 2
    * 5
* 第二个宏任务：
    * 6
        * 入队 7
    * 7