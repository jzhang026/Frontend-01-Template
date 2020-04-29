### Exotic Object
object that does not have the **default behaviour** for one or more of the essential **internal methods**

#### An exotic object is an object that is not an ordinary object.

> so what is an ordinary object. ordinary object satisfies all the criteria below, otherwise, it is an exotic object.

1. use internal essential methods (**defined in 9.1**)
  [[GetPrototypeOf]]
  [[SetPrototypeOf]]
  [[IsExtensible]]
  [[PreventExtensions]]
  [[GetOwnProperty]]
  [[DefineOwnProperty]]
  [[HasProperty]]
  [[Get]]
  [[Set]]
  [[Delete]]
  [[OwnPropertyKeys]]
2. [[Call]] internal method (**defined in 9.2.1**)
3. [[Construct]] internal method (**defined in 9.2.2**)

#### Exotic object with its own implementaion methods
1. Array exotic object
   [[DefineOwnProperty]]
2. bound function exotic object
   [[Call]]
   ?[[Construct]]
3. String Exotic Objects
   [[GetOwnProperty]]
   [[DefineOwnProperty]]
   [[OwnPropertyKeys]] 
4. Arguments Exotic Objects
   [[GetOwnProperty]]
   [[DefineOwnProperty]] 
   [[Get]]
   [[Set]]
   [[Delete]]
5. Integer-Indexed Exotic objects
   [[GetOwnProperty]]
   [[HasProperty]]
   [[DefineOwnProperty]] 
   [[Get]]
   [[Set]]
   [[OwnPropertyKeys]]
6. Module Namespace Exotic Objects
   [[SetPrototypeOf]]
   [[IsExtensible]]
   [[PreventExtensions]] 
   [[GetOwnProperty]] 
   [[DefineOwnProperty]] 
   [[HasProperty]] 
   [[Get]]
   [[Set]]
   [[Delete]]
   [[OwnPropertyKeys]]
7. Immutable Prototype Exotics Object
   [[SetPrototypeOf]]