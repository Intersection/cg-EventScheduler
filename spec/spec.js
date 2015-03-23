  describe("EventScheduler", function() {
  var dispatcher;
  var createScheduler = require("../EventScheduler");
  var scheduler;

  var topic = "myTopic";
  var message = {foo: "bar"};

  var topic2 = "topic2";
  var message2 = {foo: "baz"};

  describe("can schedule an event", function() {
    dispatcher = jasmine.createSpy("dispatch");
    scheduler = createScheduler(dispatcher);
    
    var timestamp = Date.now() + 2000;
      
    scheduler.schedule(timestamp, topic, message);
    var schedule = scheduler.report();
    var keys = Object.keys(schedule);

    it("has a single scheduled timestamp", function() {
      expect(keys.length).toBe(1);  
    });
    
      
    // this should be the delta between now and the scheduled time.
    var scheduledTime = keys[0];
    var scheduledEvents = schedule[scheduledTime];

    it("within that timestamp it has a single event", function() {      
      expect(scheduledEvents.length).toBe(1);
    });    
    
    // expect(Date.now() + scheduledTime).toBe(timestamp); // this test is unreliable because it's sometimes off by a +/- 1ms, which is immaterial

    var scheduledEvent = scheduledEvents[0];
    it("which has the topic and message originally included", function() {      
      expect(scheduledEvent.topic).toBe(topic);
      expect(scheduledEvent.message).toBe(message);
    });
    
  });

  describe("can schedule multiple events to be dispatched at the same time", function() {
    dispatcher = jasmine.createSpy("dispatch");
    scheduler = createScheduler(dispatcher);
    
    var timestamp = Date.now() + 2000;
      
    scheduler.schedule(timestamp, topic, message);
    scheduler.schedule(timestamp, topic2, message2);

    var schedule = scheduler.report();
    var keys = Object.keys(schedule);

    it ("Groups events for the same time to the same timestamp", function() {
      expect(keys.length).toBe(1);
    });

    var scheduledTime = keys[0];
    var scheduledEvents = schedule[scheduledTime];

    it ("Within that timestamp it has both events", function() {
      expect(scheduledEvents.length).toBe(2);
    });

    var event1 = scheduledEvents[0];
    var event2 = scheduledEvents[1];

    it ("Stores the events for the specified timestamp in the order they were specified.", function() {
      expect(event1.topic).toBe(topic);
      expect(event1.message).toBe(message);

      expect(event2.topic).toBe(topic2);
      expect(event2.message).toBe(message2);
    });
    
  });

  // the setup is different but the tests are the same as above
  // the implementation of the `batch` method used just wraps
  // repeated calls to `schedule`.
  describe("can schedule a batch of events", function() {
    dispatcher = jasmine.createSpy("dispatch");
    scheduler = createScheduler(dispatcher);
    
    var timestamp = Date.now() + 2000;
    var batch = [
      {timestamp: timestamp, topic: topic, message: message},
      {timestamp: timestamp, topic: topic2, message: message2}
    ];
    
    scheduler.batch(batch);

    var schedule = scheduler.report();
    var keys = Object.keys(schedule);

    it ("Groups events for the same time to the same timestamp", function() {
      expect(keys.length).toBe(1);
    });

    var scheduledTime = keys[0];
    var scheduledEvents = schedule[scheduledTime];

    it ("Within that timestamp it has both events", function() {
      expect(scheduledEvents.length).toBe(2);
    });

    var event1 = scheduledEvents[0];
    var event2 = scheduledEvents[1];
    it ("Stores the events for the specified timestamp in the order they were specified.", function() {
      expect(event1.topic).toBe(topic);
      expect(event1.message).toBe(message);

      expect(event2.topic).toBe(topic2);
      expect(event2.message).toBe(message2);
    });
  });

  describe("dispatches events", function() {
    var topic1, topic2, message1, message2, timeout1, timeout2;
    beforeEach(function(done) {
      setTimeout(done, 200);
      dispatcher.calls.reset();
      topic1 = "topic1";
      topic2 = "topic2";

      message1 = {id:"foo"};
      message2 = {id:"bar"};

      timeout1 = Date.now() + 100;
      timeout2 = Date.now() + 300;

      scheduler.schedule(timeout1, topic1, message1);
      scheduler.schedule(timeout2, topic2, message2);
    });

    it("within alloted time", function(done) {
      expect(dispatcher.calls.count()).toBe(1);
      expect(dispatcher).toHaveBeenCalledWith(topic1, message1);
      done();
    });


  });
});

