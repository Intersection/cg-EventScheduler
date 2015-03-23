# EventScheduler
A tool for scheduling events.

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
scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foobar"});
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

scheduler.batch(batch);
```

The scheduler provides a report() method that lists upcoming events, with optional start and stop thresholds. This can be accessed as structured data to be piped into a visualizer:

```
scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foo"});
scheduler.schedule(Date.now() + 4000, "myTopic", {payload: "bar"});
scheduler.report(); 
// returns an array of pending events ordered by how many milliseconds away they are.
```

Or, alternately, you can call scheduler.formatReport() to pretty-print a set of pending events for debugging:

```
var scheduler = createScheduler();
scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foo"});
scheduler.schedule(Date.now() + 4000, "myTopic", {payload: "bar"});
scheduler.schedule(Date.now() + 2000, "myTopic", {payload: "foo2"});
scheduler.schedule(Date.now() + 4000, "myTopic", {payload: "bar2"});
scheduler.formatReport(); 

/* Prints:

Pending Scheduler events:
  In 1998ms, scheduler will publish:
    [myTopic] Object {payload: "foo"}
  In 3998ms, scheduler will publish:
    [myTopic] Object {payload: "bar"}

*/
```