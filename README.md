# EventScheduler
A tool for scheduling events.

```npm test``` to run jasmine test suite.

You need to provide an event dispatching function with the following signature:

``` function dispatch(topic, message) {} ```

If you don't provide one, it'll use its own for debugging purposes which simply logs events to the console. To use EventScheduler.js, simply call the createScheduler method with your dispatch function:

``` 
var scheduler = createScheduler(function(topic, message) { 
  // broadcast your message to your topic 
  myEventBus.pub(topic, message);
}); 
```

Once the scheduler has been created you can either schedule events one at a time:

```
var scheduledEvent = scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foobar"});
```

Or you can schedule events by batch:

```
var batch = [];
for (var i = 0; i < 100; i++) {
  batch.push( {
    timestamp: Date.now + (i * 100),
    topic: "MyTestBatch",
    message: {index: i}
  })
}

var scheduledEvents = scheduler.batch(batch);
```

The schedule method returns the scheduled event, and the batch method returns an array of scheduled events. These are useful if you want to cancel an event - prevent it from being dispatched
after you've scheduled it. You can call scheduledEvent.cancel() and the EventScheduler will not dispatch it once its time comes. Note: the event is NOT removed from the queue - it remains
until the provided timestamp, at which point it's removed without being dispatched. So don't rely on cancel() to clean up EventScheduler memory.

```
var scheduledEvent = scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foobar"});
scheduledEvent.cancel(); // this will never get dispatched
```

The scheduler provides a report() method that lists upcoming events, with optional start and stop thresholds. This can be accessed as structured data to be piped into a visualizer:

```
scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foo"});
scheduler.schedule(Date.now() + 4000, "myTopic", {payload: "bar"});
scheduler.report(); 
// returns an array of pending events ordered by how many milliseconds away they are.
```

Or, alternately, you can call scheduler.formatReport() to pretty-print a set of pending events for debugging. Canceled events are included, but show up red and specify that they've been canceled:

```
var scheduler = createScheduler();
scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foo"});
scheduler.schedule(Date.now() + 3000, "myTopic", {payload: "bar"});
var cancelMe = scheduler.schedule(Date.now() + 4000, "myTopic", {payload: "foo2"});
scheduler.schedule(Date.now() + 5000, "myTopic", {payload: "bar2"});

cancelMe.cancel();
scheduler.formatReport(); 

/* Prints:

Pending Scheduler events:
  In 2000ms, scheduler will publish:
    [myTopic] Object {payload: "foo"}
  In 3000ms, scheduler will publish:
    [myTopic] Object {payload: "bar"}
  In 3999ms, scheduler will publish:
    [myTopic - canceled] Object {payload: "foo2"}
  In 4999ms, scheduler will publish:
    [myTopic] Object {payload: "bar2"}
*/
```