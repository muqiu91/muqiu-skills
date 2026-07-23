# Python题库（12题）

## 语言特性

**1. Python的GIL是什么？如何绕过？**
- A: 全局解释器锁，同一时刻只有一个线程执行Python字节码。绕过：多进程（multiprocessing）、C扩展、asyncio、Numba。
- 追问：GIL是Python语言的特性还是CPython的实现？

**2. Python的内存管理机制？**
- A: 引用计数为主，标记-清除和分代回收处理循环引用。三代：gen0（新对象）、gen1、gen2。小对象有内存池机制。
- 追问：如何查看对象的引用计数？

**3. 装饰器是什么？如何实现一个带参数的装饰器？**
- A: 接受函数并返回新函数的高阶函数。带参数：三层嵌套函数，最外层接收装饰器参数，中间层接收被装饰函数，最内层是包装函数。
- 追问：functools.wraps的作用？

**4. Python的可变对象和不可变对象？**
- A: 不可变：int、str、tuple、frozenset。可变：list、dict、set。不可变对象修改会创建新对象。
- 追问：为什么字典的key必须是不可变对象？

**5. 列表推导式和生成器表达式的区别？**
- A: 列表推导式[x for x in range(10)]返回列表，一次性生成所有元素。生成器表达式(x for x in range(10))返回生成器，惰性求值。
- 追问：什么时候用生成器？

**6. *args和**kwargs的作用？**
- A: *args接收任意数量的位置参数（元组），**kwargs接收任意数量的关键字参数（字典）。
- 追问：函数参数的顺序？

## 进阶

**7. Python的迭代器和可迭代对象？**
- A: 可迭代对象实现__iter__()方法，返回迭代器。迭代器实现__next__()方法。for循环先调用iter()获取迭代器，再不断调用next()。
- 追问：如何自定义一个迭代器？

**8. Python的上下文管理器？with语句的原理？**
- A: 实现__enter__()和__exit__()方法。with进入时调用__enter__()，退出时调用__exit__()（即使异常）。contextlib.contextmanager简化实现。
- 追问：__exit__的参数是什么？

**9. Python的多线程和多进程？**
- A: threading模块实现多线程（受GIL限制），multiprocessing模块实现多进程。CPU密集型用多进程，IO密集型用多线程或asyncio。
- 追问：进程间如何通信？

**10. Python的异步编程？async/await如何使用？**
- A: asyncio实现协程，async定义协程函数，await等待协程结果。事件循环调度协程执行。
- 追问：asyncio和多线程的区别？

**11. Python的元类是什么？**
- A: 类的类，用于创建类。type是默认元类。通过__new__和__init__控制类的创建过程。
- 追问：元类有什么应用场景？

**12. Python的描述符是什么？**
- A: 实现__get__、__set__、__delete__方法的对象。用于控制属性的访问。property、classmethod、staticmethod都是描述符。
- 追问：描述符的优先级？
