dispatch:infinite-queue
=======================

```js
  var syncQueue = createQueue();

  syncQueue.add(function() {
    // Task
    this.next();
  });
```

#### Options
* `minDuration` - Set the minimum queue duration


#### Api
* `.add(task)` - Run task
* `.addEvery(tick, task)` - Run task at every 1 or `n` tick
* `.next()` - Run next task

TODO:
* Write basic tests
* Option to set limit on simultane running tasks