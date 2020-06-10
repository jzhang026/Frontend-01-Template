# 每周总结可以写在这里

## CSS 动画

### transitions

#### 定义

Enables the transition of properties from one state to the next over a defined length of time

transition-property: properties (or 'all') that transition
transition-duration: s or ms it takes to transition
transition-timing-function: bezier curve of transition
transition-delay: s or ms before transition starts
transition: shorthand for 4 transition properties

#### 什么样的属性可以被 transitioned

1. Anything that has intermediate values
   such as:

```css
code {
  opacity: 1;
}
code:halfway {
  opacity: 0.5;
}
code:hover {
  opacity: 0;
}
```

but `display` is not:

```css
code {
  display: block;
}
code:halfway {
  display: ???;
}
code:hover {
  display: none;
}
```

2. values that have REAL intermediary values
   YES:
   ```css
   code {
     font-size: 100%;
   }
   code:halfway {
     font-size: 110%;
   }
   code:hover {
     font-size: 120%;
   }
   ```

NO:

```css
code {
  height: auto;
}
code:halfway {
  height: ???;
}
code:hover {
  height: 1000px;
}
```

#### transition 属性的一些局限性

- Single Iteration
- Reverse goes to initial state
- No granular control
- Limited methods of initiation
- Can't force them to finish

#### transition event

- Event thrown only when transition completes
- transitionend for EVERY property
- transitionend for each long-hand property within a shorthand

### animations

> 使用前需要考虑一些兼容性问题
> Prefix -webkit- for < iOS9 / Safari 9 and Android <= 4.4.4

#### animation 的一些特性和限制

- Single, many or infinite iterations
- Single or bi-directional
- Granular control
- Can be initiated on page load
- Has more robust JS Hooks
- Can be paused
- Lowest priority in UI Thread

#### animation 的主要属性

- @keyframes
- animation-name
- animation-duration
- animation-timing-function
- animation-iteration-count
- animation-direction
- animation-play-state
- animation-delay
- animation-fill-mode
- animation (shorthand)

##### `!important` is ignored:

```css
div {
  animation: test infinite 10s alternate;
  background: red;
  border: 5px black solid;
}
@keyframes test {
  45% {
    background: green;
  }
  55% {
    background: blue !important; /* no effect */
    border-width: 20px !important; /* no effect */
  }
}
```

##### animating multiple properties

```css
@keyframes W {
  0% {
    left: 0;
    top: 0;
  }
  25%,
  75% {
    top: 400px;
  }
  50% {
    top: 50px;
  }
  100% {
    left: 80%;
    top: 0;
  }
}
```

#### css specificity in animation

Based on ID, background-color should be black, but because an animation is attached, it is grey.

based on !important the border should be black, but some browsers override !important (currrently erroneously, but spec is likely changing).

```css
#blue {
  background-color: #9999ff;
}
div {
  border: 5px black solid !important;
  background-color: black !important;
  animation: grey infinite 3s alternate;
}

@keyframes grey {
  from {
    background-color: #999;
    border: 5px red dashed;
  }
  to {
    background-color: #ccc;
    border: 5px yellow dashed;
  }
}
```
