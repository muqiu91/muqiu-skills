# Java基础题库（15题）

## JVM

**1. JVM内存结构是怎样的？**
- A: 堆（对象实例、GC管理）、虚拟机栈（局部变量、方法调用）、本地方法栈（Native方法）、方法区/元空间（类信息、常量池）、程序计数器（当前指令地址）。
- 追问：堆和栈的区别？

**2. 垃圾回收的算法有哪些？**
- A: 标记-清除（碎片化）、标记-整理（无碎片，耗时）、复制算法（浪费空间）、分代收集（新生代用复制，老年代用标记-整理）。
- 追问：为什么新生代用复制算法？

**3. 常见的垃圾回收器有哪些？G1的特点？**
- A: Serial、Parallel、CMS、G1、ZGC。G1特点：分Region、可预测的停顿时间、支持大堆、并发标记。
- 追问：CMS的问题是什么？G1如何解决？

**4. 什么是类加载机制？双亲委派模型是什么？**
- A: 加载→验证→准备→解析→初始化。双亲委派：先委托父类加载器，找不到才自己加载。保证核心类的唯一性。
- 追问：什么情况下需要打破双亲委派？

**5. 什么是JIT编译器？分层编译是什么？**
- A: JIT将热点代码编译为本地机器码。分层编译：C1（快速编译、简单优化）→C2（慢速编译、深度优化）。
- 追问：如何判断热点代码？

## 并发

**6. synchronized的实现原理？锁升级过程？**
- A: 基于Monitor，字节码monitorenter/monitorexit。锁升级：无锁→偏向锁（单线程）→轻量级锁（CAS自旋）→重量级锁（阻塞）。
- 追问：偏向锁什么时候会撤销？

**7. volatile的作用？底层如何实现？**
- A: 保证可见性（写入后立即同步到主内存）、禁止指令重排序。底层：内存屏障（Store Barrier、Load Barrier）。
- 追问：volatile能保证原子性吗？

**8. CAS是什么？ABA问题如何解决？**
- A: Compare and Swap，比较并交换，乐观锁的实现。ABA问题：值从A变B再变A，CAS认为没变。解决：加版本号（AtomicStampedReference）。
- 追问：CAS的缺点？

**9. 线程池的核心参数？如何设置线程数？**
- A: corePoolSize、maximumPoolSize、keepAliveTime、workQueue、threadFactory、handler。CPU密集型：N+1，IO密集型：2N或N/(1-阻塞系数)。
- 追问：线程池的拒绝策略有哪些？

**10. AQS是什么？ReentrantLock如何实现？**
- A: AbstractQueuedSynchronizer，基于CLH队列实现同步器。ReentrantLock通过AQS的state变量记录重入次数，获取锁时CAS修改state。
- 追问：公平锁和非公平锁的区别？

## 集合

**11. ArrayList和LinkedList的区别？**
- A: ArrayList基于数组，随机访问O(1)，插入删除O(n)。LinkedList基于双向链表，插入删除O(1)（已知位置），随机访问O(n)。
- 追问：ArrayList扩容机制？

**12. HashMap在JDK7和JDK8的区别？**
- A: JDK7：数组+链表，头插法，扩容时可能死循环。JDK8：数组+链表/红黑树，尾插法，链表长度>8转红黑树。
- 追问：HashMap为什么线程不安全？

**13. ConcurrentHashMap的实现原理？**
- A: JDK7：分段锁（Segment），每个Segment独立加锁。JDK8：CAS+synchronized，锁粒度细化到桶级别。
- 追问：ConcurrentHashMap的size()如何实现？

## 其他

**14. Java的异常体系？受检异常和非受检异常的区别？**
- A: Throwable→Error/Exception。Exception→RuntimeException（非受检）/其他（受检）。受检异常必须处理（try-catch或throws），非受检异常可以不处理。
- 追问：Error和Exception的区别？

**15. Java的反射机制？有什么应用场景？**
- A: 运行时获取类的信息并操作。Class.forName()、getMethod()、invoke()。应用：框架（Spring IoC）、动态代理、ORM。
- 追问：反射的性能问题？如何优化？
