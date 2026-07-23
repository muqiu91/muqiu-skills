# Java进阶题库（基于CSDN文章补充）

本文件补充Java基本知识和设计模式相关面试题。

---

## 一、Java基本知识

### 1.1 JVM相关（补充）

**1. JVM内存区域详解：程序计数器、虚拟机栈、本地方法栈的作用？**
- A: 程序计数器：指示当前线程执行的字节码行号，线程私有，唯一不会OOM的区域。虚拟机栈：存储栈帧（局部变量表、操作数栈、动态链接、方法出口），方法调用时入栈，执行完出栈。本地方法栈：执行Native方法。
- 追问：栈帧中的局部变量表存储什么？

**2. 堆内存的分代模型？新生代和老年代的比例？**
- A: 新生代（Eden + Survivor0 + Survivor1，比例8:1:1）、老年代。默认新生代:老年代 = 1:2。对象先在Eden分配，经过Minor GC存活的进入Survivor，多次存活后晋升老年代。
- 追问：什么情况下对象会直接进入老年代？

**3. 方法区/元空间存储什么？JDK7和JDK8有什么变化？**
- A: 存储类信息、常量池、静态变量、JIT编译后的代码。JDK7方法区在堆中（永久代），JDK8改为元空间（本地内存），避免永久代OOM。
- 追问：为什么要用元空间替代永久代？

**4. 什么是逃逸分析？有什么优化作用？**
- A: 分析对象的作用域，判断是否逃逸出方法或线程。优化：栈上分配（不逃逸的对象分配在栈上）、标量替换（将对象拆解为基本类型）、锁消除（单线程访问时消除同步）。
- 追问：如何开启/关闭逃逸分析？

**5. 什么是Stop-The-World（STW）？如何减少STW时间？**
- A: GC时暂停所有用户线程。减少STW：使用并发收集器（CMS、G1、ZGC）、减少Full GC频率、调整堆大小、选择合适的GC算法。
- 追问：哪些GC阶段会STW？

**6. 什么是安全点（Safepoint）和安全区域（Safe Region）？**
- A: 安全点：程序执行时可以安全暂停进行GC的位置（方法调用、循环跳转、异常跳转）。安全区域：代码片段中引用关系不变，线程在此区域内可以安全GC。
- 追问：为什么需要安全区域？

### 1.2 ClassLoader相关

**7. Java的类加载过程？每个阶段做什么？**
- A: 加载（读取字节码、创建Class对象）→验证（文件格式、元数据、字节码、符号引用）→准备（为静态变量分配内存并赋默认值）→解析（符号引用转直接引用）→初始化（执行<clinit>静态代码块）。
- 追问：准备阶段和初始化阶段对静态变量的处理有什么区别？

**8. 双亲委派模型是什么？为什么需要双亲委派？**
- A: 类加载器收到请求先委托父加载器，父加载器无法加载才自己加载。层次：Bootstrap ClassLoader → Extension ClassLoader → Application ClassLoader → 自定义ClassLoader。目的：保证核心类库的安全性和唯一性。
- 追问：如果没有双亲委派会有什么问题？

**9. 什么情况下需要打破双亲委派？如何打破？**
- A: 场景：JNDI、JDBC、Tomcat、OSGi、热部署。打破方式：重写loadClass()方法（而非findClass()）、使用线程上下文类加载器（Thread.currentThread().getContextClassLoader()）。
- 追问：Tomcat为什么要打破双亲委派？

**10. 自定义ClassLoader如何实现？**
- A: 继承ClassLoader，重写findClass()方法，调用defineClass()将字节码转为Class对象。如果要打破双亲委派，需要重写loadClass()。
- 追问：defineClass()方法的作用？

**11. Android的ClassLoader和Java的有什么区别？**
- A: Android使用DexClassLoader和PathClassLoader加载dex文件。PathClassLoader只能加载已安装的apk，DexClassLoader可以加载任意路径的dex/jar/apk。底层都是BaseDexClassLoader。
- 追问：Android热修复是如何利用ClassLoader的？

### 1.3 进程相关

**12. Java进程和线程的区别？**
- A: 进程是资源分配的基本单位，有独立的内存空间。线程是CPU调度的基本单位，共享进程的内存空间。进程间通信复杂，线程间通信简单。
- 追问：Java中如何创建新进程？

**13. Runtime.exec()和ProcessBuilder的区别？**
- A: Runtime.exec()是简单方式，ProcessBuilder更灵活，支持环境变量设置、工作目录设置、输入输出重定向、管道连接多个进程。
- 追问：如何获取子进程的输出？

### 1.4 线程相关

**14. Java创建线程的方式有哪些？**
- A: (1)继承Thread类 (2)实现Runnable接口 (3)实现Callable接口（有返回值）(4)线程池ExecutorService。推荐使用线程池，避免频繁创建销毁线程。
- 追问：Callable和Runnable的区别？

**15. 线程的生命周期和状态？**
- A: NEW（创建）→RUNNABLE（就绪/运行）→BLOCKED（阻塞，等待锁）→WAITING（无限等待）→TIMED_WAITING（超时等待）→TERMINATED（终止）。
- 追问：BLOCKED和WAITING的区别？

**16. Thread.sleep()和Object.wait()的区别？**
- A: sleep()是Thread的静态方法，不释放锁，到时间自动醒来。wait()是Object的方法，必须在同步块中调用，释放锁，需要notify()/notifyAll()唤醒。
- 追问：为什么wait()必须在同步块中调用？

**17. 如何优雅地停止线程？**
- A: 使用volatile标志位或interrupt()。不推荐stop()（已废弃，可能导致数据不一致）。线程内部检查isInterrupted()或捕获InterruptedException后退出。
- 追问：interrupt()和isInterrupted()的区别？

**18. ThreadLocal的原理和应用场景？**
- A: 每个线程有自己的ThreadLocalMap，以ThreadLocal为key存储值。应用：数据库连接、Session、SimpleDateFormat等线程不安全对象的隔离。
- 追问：ThreadLocal内存泄漏问题？如何解决？

**19. 线程间通信的方式有哪些？**
- A: (1)共享变量+volatile/synchronized (2)wait()/notify() (3)Lock+Condition (4)BlockingQueue (5)CountDownLatch/CyclicBarrier/Semaphore (6)Future/CompletableFuture。
- 追问：生产者消费者模式如何实现？

### 1.5 并发相关（补充）

**20. Java内存模型（JMM）是什么？解决什么问题？**
- A: JMM定义了线程和主内存之间的抽象关系，解决可见性、原子性、有序性问题。主内存存储共享变量，每个线程有工作内存（主内存的副本）。
- 追问：happens-before原则是什么？

**21. synchronized和ReentrantLock的区别？**
- A: synchronized是JVM层面的，自动释放锁；ReentrantLock是API层面的，需要手动lock()/unlock()。ReentrantLock支持公平锁、可中断、超时、多条件变量。
- 追问：什么时候用synchronized，什么时候用ReentrantLock？

**22. 什么是读写锁？ReentrantReadWriteLock的特点？**
- A: 读锁可多线程共享，写锁独占。适合读多写少场景。ReentrantReadWriteLock支持锁降级（写锁→读锁），但不支持锁升级。
- 追问：什么是锁降级？为什么不支持锁升级？

**23. CountDownLatch和CyclicBarrier的区别？**
- A: CountDownLatch：一次性，计数减到0后不能重用，主线程等待多个子线程完成。CyclicBarrier：可循环使用，多个线程相互等待到达屏障点，然后一起继续。
- 追问：各自的应用场景？

**24. Semaphore的作用和使用场景？**
- A: 信号量，控制同时访问资源的线程数量。acquire()获取许可，release()释放许可。应用：限流、连接池。
- 追问：如何用Semaphore实现互斥锁？

**25. CompletableFuture的使用？相比Future有什么优势？**
- A: 支持链式调用、组合多个异步任务、异常处理。方法：thenApply()、thenAccept()、thenCombine()、exceptionally()、allOf()、anyOf()。
- 追问：thenApply()和thenCompose()的区别？

**26. Fork/Join框架是什么？工作窃取算法？**
- A: 分治思想，将大任务拆分为小任务，结果合并。工作窃取：空闲线程从其他线程的双端队列尾部窃取任务，减少竞争。
- 追问：RecursiveTask和RecursiveAction的区别？

### 1.6 Clone相关

**27. Java的clone()方法？浅拷贝和深拷贝的区别？**
- A: clone()是Object的protected方法，需要实现Cloneable接口。浅拷贝只复制对象本身，引用类型字段仍指向同一对象。深拷贝递归复制所有引用对象。
- 追问：如何实现深拷贝？

**28. 实现深拷贝的方式有哪些？**
- A: (1)重写clone()递归克隆引用对象 (2)序列化/反序列化（Serializable） (3)JSON序列化 (4)手动创建新对象赋值。
- 追问：哪种方式性能最好？

### 1.7 注解相关

**29. Java注解的原理？如何自定义注解？**
- A: 注解本质是接口，继承自Annotation。自定义：@interface定义，@Target指定作用目标，@Retention指定保留策略（SOURCE/CLASS/RUNTIME）。
- 追问：三种保留策略的区别？

**30. 注解的解析方式？编译时注解和运行时注解？**
- A: 编译时注解：通过注解处理器（APT）处理，生成代码，如Lombok、ButterKnife。运行时注解：通过反射获取，如Spring的@Autowired。
- 追问：APT的工作原理？

**31. 常见的元注解有哪些？**
- A: @Target（作用目标：TYPE/METHOD/FIELD等）、@Retention（保留策略）、@Documented（生成javadoc）、@Inherited（子类继承）、@Repeatable（可重复注解，JDK8）。
- 追问：@Inherited的使用场景？

### 1.8 异常相关

**32. Java的异常体系？Error和Exception的区别？**
- A: Throwable → Error（系统错误，不可恢复，如OOM、StackOverflow）/ Exception。Exception → RuntimeException（非受检）/ 其他（受检）。
- 追问：常见的RuntimeException有哪些？

**33. 受检异常和非受检异常的区别？**
- A: 受检异常（Checked Exception）：编译器强制处理，必须try-catch或throws。非受检异常（Unchecked Exception）：RuntimeException及其子类，可以不处理。
- 追问：为什么要区分受检和非受检异常？

**34. try-with-resources的原理？**
- A: JDK7引入，自动关闭实现AutoCloseable接口的资源。编译器转换为try-finally，在finally中调用close()。多个资源按声明相反顺序关闭。
- 追问：如果close()方法抛异常怎么办？

**35. finally和return的执行顺序？**
- A: finally一定会执行（除非JVM退出）。如果try中有return，先执行return的表达式，再执行finally，最后返回。如果finally中有return，会覆盖try中的return。
- 追问：finally中修改返回值会影响结果吗？

---

## 二、设计模式

### 2.1 创建型模式

**36. 单例模式的实现方式有哪些？如何保证线程安全？**
- A: (1)饿汉式（类加载时创建）(2)懒汉式+synchronized (3)双重检查锁（DCL）+volatile (4)静态内部类（推荐）(5)枚举（最佳，防止反射和序列化破坏）。
- 追问：为什么DCL需要volatile？

**37. 工厂模式的三种形式？各自的适用场景？**
- A: 简单工厂（一个工厂创建所有产品）、工厂方法（每种产品一个工厂）、抽象工厂（创建产品族）。简单工厂适合产品少的场景，工厂方法适合产品扩展，抽象工厂适合多系列产品。
- 追问：Spring的BeanFactory是哪种工厂模式？

**38. 建造者模式的使用场景？和工厂模式的区别？**
- A: 适合构建复杂对象，参数多且有默认值。与工厂模式区别：工厂关注创建对象，建造者关注对象的构建过程。常见实现：Builder内部类+链式调用。
- 追问：Lombok的@Builder注解是什么原理？

**39. 原型模式是什么？有什么应用场景？**
- A: 通过复制现有对象创建新对象，避免重复初始化。Java中通过clone()实现。应用：对象创建成本高、需要大量相似对象。
- 追问：原型模式和new的区别？

### 2.2 结构型模式

**40. 代理模式的实现方式？静态代理和动态代理的区别？**
- A: 静态代理：编译时确定代理类。动态代理：运行时生成代理类，JDK动态代理（基于接口，Proxy+InvocationHandler）、CGLIB（基于继承，字节码增强）。
- 追问：Spring AOP用的是哪种代理？

**41. JDK动态代理的原理？**
- A: Proxy.newProxyInstance()生成代理对象，方法调用时转发到InvocationHandler.invoke()。代理类继承Proxy并实现目标接口。
- 追问：为什么JDK动态代理只能代理接口？

**42. CGLIB的原理？和JDK动态代理的区别？**
- A: CGLIB通过ASM生成目标类的子类，重写方法实现增强。区别：JDK代理基于接口，CGLIB基于继承。CGLIB不能代理final类和方法。
- 追问：哪种代理性能更好？

**43. 适配器模式和装饰器模式的区别？**
- A: 适配器：将不兼容的接口转换为目标接口，解决接口不匹配。装饰器：动态扩展对象功能，不改变接口。适配器改变接口，装饰器增强功能。
- 追问：Java IO中哪里用了装饰器模式？

**44. 外观模式（门面模式）的作用？**
- A: 为复杂子系统提供统一的简单接口，降低客户端和子系统的耦合。应用：SLF4J作为日志门面。
- 追问：外观模式和中介者模式的区别？

**45. 组合模式是什么？有什么应用场景？**
- A: 将对象组合成树形结构，使单个对象和组合对象使用一致。应用：文件系统（文件和文件夹）、UI组件树、组织架构。
- 追问：安全组合模式和透明组合模式的区别？

### 2.3 行为型模式

**46. 策略模式是什么？如何消除if-else？**
- A: 定义一系列算法，封装到独立的策略类中，运行时动态选择。用Map<类型, 策略>替代if-else，或Spring注入策略列表。
- 追问：策略模式和状态模式的区别？

**47. 观察者模式的实现？Java内置的Observer接口？**
- A: 被观察者维护观察者列表，状态变化时通知所有观察者。Java的Observable/Observer（已废弃），推荐使用PropertyChangeSupport或事件总线（EventBus）。
- 追问：观察者模式和发布订阅模式的区别？

**48. 模板方法模式是什么？有什么应用？**
- A: 父类定义算法骨架，子类实现具体步骤。应用：JdbcTemplate、HttpServlet的service()方法、AbstractList的get()方法。
- 追问：模板方法中的钩子方法是什么？

**49. 责任链模式是什么？如何实现？**
- A: 多个处理器组成链条，请求沿链传递直到被处理。实现：每个Handler持有下一个Handler的引用，或用List存储Handler。应用：Filter链、拦截器链、审批流程。
- 追问：责任链模式如何终止传递？

**50. 状态模式是什么？和策略模式的区别？**
- A: 允许对象在内部状态改变时改变行为。区别：状态模式的状态会自动转换，策略模式由客户端选择策略。状态模式关注状态转换，策略模式关注算法替换。
- 追问：状态机如何实现？

**51. 命令模式是什么？有什么应用场景？**
- A: 将请求封装为对象，支持参数化、排队、日志、撤销。应用：任务队列、事务回滚、Runnable就是命令模式。
- 追问：如何实现撤销功能？

**52. 迭代器模式是什么？Java的Iterator？**
- A: 提供遍历集合的统一接口，不暴露内部结构。Java的Iterator：hasNext()、next()、remove()。增强for循环底层就是Iterator。
- 追问：为什么遍历时不能用集合的remove()？

**53. 中介者模式是什么？和观察者模式的区别？**
- A: 用中介者对象封装多个对象的交互，减少对象间的直接依赖。区别：观察者是一对多的单向依赖，中介者是多对多的双向依赖。
- 追问：MVC中的Controller是中介者吗？

### 2.4 设计模式综合

**54. 常用的设计原则有哪些？**
- A: SOLID原则：单一职责（SRP）、开闭原则（OCP，对扩展开放，对修改关闭）、里氏替换（LSP）、接口隔离（ISP）、依赖倒置（DIP）。还有：迪米特法则、组合优于继承。
- 追问：如何在实际项目中应用开闭原则？

**55. 如何选择合适的设计模式？**
- A: 根据问题场景：创建对象用创建型、组合对象用结构型、对象交互用行为型。不要为了用模式而用，解决问题最重要。过度设计比没有设计更糟糕。
- 追问：你在项目中用过哪些设计模式？

---

## 三、Java集合补充

**56. ArrayList的扩容机制？初始容量是多少？**
- A: 初始容量10（首次add时分配），扩容为1.5倍（oldCapacity + oldCapacity >> 1）。扩容时创建新数组并拷贝元素。
- 追问：如何避免频繁扩容？

**57. HashMap的hash()方法为什么要高位异或低位？**
- A: 减少哈希冲突。hashCode的高位参与运算，让低位也包含高位的信息，使元素分布更均匀。(h = key.hashCode()) ^ (h >>> 16)。
- 追问：为什么HashMap的容量必须是2的幂？

**58. HashMap的put流程？**
- A: 计算hash→定位桶→桶为空直接插入→桶不为空比较key（先hash再equals）→相同则覆盖，不同则插入链表/红黑树→检查是否需要扩容。
- 追问：什么时候链表转红黑树？

**59. LinkedHashMap如何实现有序？**
- A: 继承HashMap，额外维护双向链表记录插入顺序（或访问顺序）。可用于实现LRU缓存（accessOrder=true）。
- 追问：如何用LinkedHashMap实现LRU缓存？

**60. TreeMap的实现原理？**
- A: 基于红黑树实现，key有序。需要key实现Comparable或构造时传入Comparator。时间复杂度O(logn)。
- 追问：TreeMap和HashMap的区别？

---

## 四、Java IO/NIO补充

**61. BIO、NIO、AIO的区别？**
- A: BIO：同步阻塞，一个连接一个线程。NIO：同步非阻塞，多路复用，一个线程处理多个连接。AIO：异步非阻塞，操作完成后回调通知。
- 追问：Netty用的是哪种IO模型？

**62. NIO的核心组件？**
- A: Channel（双向通道）、Buffer（缓冲区）、Selector（多路复用器）。数据在Channel和Buffer之间传输，Selector监听多个Channel的事件。
- 追问：Buffer的flip()和clear()方法的作用？

**63. 什么是零拷贝？Java如何实现？**
- A: 减少数据在内核态和用户态之间的拷贝次数。Java实现：FileChannel.transferTo()、MappedByteBuffer（内存映射文件）。
- 追问：零拷贝的原理是什么？

---

## 五、JVM调优补充

**64. 常用的JVM参数有哪些？**
- A: 堆大小：-Xms、-Xmx。新生代：-Xmn。元空间：-XX:MetaspaceSize。GC：-XX:+UseG1GC。日志：-Xlog:gc*。堆转储：-XX:+HeapDumpOnOutOfMemoryError。
- 追问：-Xms和-Xmx设置成一样有什么好处？

**65. 如何排查OOM问题？**
- A: 开启HeapDumpOnOutOfMemoryError→用MAT/VisualVM分析堆转储→找到占用内存最大的对象→分析GC Roots引用链→定位代码问题。
- 追问：常见的OOM原因有哪些？

**66. 如何排查CPU 100%问题？**
- A: top找到高CPU的进程→top -Hp找到高CPU的线程→printf '%x'转换线程ID为16进制→jstack导出线程栈→搜索线程ID→分析代码。
- 追问：常见的CPU 100%原因有哪些？

**67. 常用的JVM调优工具？**
- A: 命令行：jps、jstat、jmap、jstack、jinfo。图形化：JVisualVM、JConsole、MAT、Arthas（阿里开源）。
- 追问：Arthas有什么功能？
