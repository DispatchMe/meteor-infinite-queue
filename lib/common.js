/**
 * Create an instance of the infinite queue
 * @param {Object} options
 * @param {Number} options.minDuration Set the minimum duration of a cycle
 * @param {Number} options.interval Set the duration of tick default == 500ms
 */
InfiniteQueue = function(options) {
  var self = this;

  // Make sure options exists
  options = options || {};

  // Make sure we have an instance returned to the user
  if (!(self instanceof InfiniteQueue))
    return new InfiniteQueue(options);

  // Flag set true if running
  self.running = false;

  // Ready flag
  self.ready = true;

  // Queue
  self.queue = [];

  self.eventemitter = new EventEmitter();

  // The min duration for a queue tick
  self.minDuration = options.minDuration || 0;

  if (self.minDuration) {
    self.queue.push(function() {
      var self = this;
      // Get the current time
      var currentTime = +new Date();
      // Get last time
      var lastTime = self.lastTime || currentTime;
      // Calc the time diff
      var diff = currentTime - lastTime;
      // Calc the expected duration
      var duration = Math.max(0, self.minDuration - diff);
      // Emit "wait" event
      self.eventemitter.emit('wait', {
        minDuration: self.minDuration,
        duration: duration
      });

      // Call next with a pause
      Meteor.setTimeout(function() {
        // Store the last time
        self.lastTime = +new Date();
        // Run the next task
        self.next();
      }, duration);
    });
  }

  self.handle = Meteor.setInterval(function() {
    if (self.ready && self.running) {
      self.ready = false;

      self.eventemitter.emit('next');

      // Move task and get handle
      var task = self.queue.shift();

      if (typeof task === 'function') {
        self.queue.push(task);

        try {
          // Run the task
          task.call(self);
        } catch(err) {
          self.eventemitter.emit('error', {
            type: 'run task',
            message: err.message
          });

          // On error make ready for next task
          self.next();
        }
      }


    }
  }, options.interval || 500);
};

// Generel helpers
var _every = function(everyTick, f) {
  var counter = 0;
  return function() {
    counter++;

    if (counter === everyTick) {
      counter = 0;
      f.call(this);
    } else {
      // Skip this function
      this.next();
    }
  };
};

/**
 * Add a task on every tick
 * @param {Function} task Task to run
 */
InfiniteQueue.prototype.add = function(task) {
  var self = this;

  // Add the task to the queue
  self.queue.push(task);

  self.eventemitter.emit('addTask');
};

/**
 * Add a task at every X tick
 * @param {Number} tick Run pr. tick
 * @param {Function} task Task to run
 */
InfiniteQueue.prototype.addEvery = function(tick, task) {
  var self = this;

  // Add the task to the queue
  self.queue.push(_every(tick, task));
  self.eventemitter.emit('addTaskEvery', tick);
};

/**
 * Run next task
 */
InfiniteQueue.prototype.next = function() {
  var self = this;

  self.ready = true;
  self.running = true;
};

/**
 * Start the queue
 */
InfiniteQueue.prototype.start = function() {
  this.eventemitter.emit('start');
  return this.next();
};

/**
 * Stop the queue
 */
InfiniteQueue.prototype.stop = function() {
  if (this.running) {
    this.eventemitter.emit('stop');
    this.running = false;
  }
};

/**
 * Listen to events
 * @param  {String} name Name of event
 * @param  {Function} f    Callback
 */
InfiniteQueue.prototype.on = function(name, f) {
  return this.eventemitter.on(name, f);
};

/**
 * Remove listener
 * @param  {String} name Name of event
 * @param  {Function} f    Callback to remove
 */
InfiniteQueue.prototype.off = function(name, f) {
  return this.eventemitter.off(name, f);
};
