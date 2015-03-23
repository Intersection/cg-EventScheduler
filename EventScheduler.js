(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.createScheduler = factory();
    }
}(this, function createScheduler() {
    return function(dispatch) {
      if (!dispatch) {
        console.warn("Dispatch function not provided to scheduler, running in debug mode.");
        dispatch = function(topic, message) {
          console.log("[" + topic + "]", message);
        };
      }

      // refactor to use events.keys() rather than a separate queue?
      var queue = [];
      var events = {};

      var scheduleProcess = setInterval(onTick, 100);

      function onTick() {
        while (queue[0] <= Date.now()) {
          processTimestamp(queue.shift());
        }
      }

      function processTimestamp(timestamp) {
        var pending = events[timestamp];
        if (pending) {
          pending.forEach(function(e) {
            dispatch(e.topic, e.message);
          });

          delete events[timestamp];
        }
      }

      function schedule(timestamp, topic, message) {
        queue.push(timestamp);
        queue.sort(function(a, b) {
          return a - b;
        });

        if (!events[timestamp]) {
          events[timestamp] = [];
        }

        events[timestamp].push({
          topic: topic,
          message: message
        });
      }

      function batch(source) {
        source.forEach(function(scheduledItem) {
          schedule(scheduledItem.timestamp, scheduledItem.topic, scheduledItem.message);
        });
      }

      function report(fromTime, toTime) {
        if (!fromTime) {
          fromTime = Date.now();
        }

        if (!toTime) {
          toTime = Infinity;
        }

        var output = {};
        
        queue.every(function(ts) {
          // the queue is sorted, so if we hit a timestamp that's greater than our stopping time we can quit out of this.
          if (ts > toTime) {
            return false;
          }

          // ignore elements prior to our specified startTime
          if (ts >= fromTime) {
            var delta = ts - Date.now();
            
            // this is to avoid duplicating output, since each delta would contain all events for that timestamp.
            if (!output[delta]) {
              output[delta] = events[ts];
            }        
          }

          return true; // function passed into [].every() MUST return true or it'll abort itself.
        });

        return output;
      }

      function formatReport(fromTime, toTime) {
        var data = report(fromTime, toTime);
        console.log("Pending Scheduler events:");
        for (var timestamp in data) {
          console.group("In " + timestamp + "ms, scheduler will publish:");
          data[timestamp].forEach(function(event) {        
            console.log("[" + event.topic + "]", event.message);        
          });
          console.groupEnd();
        }        
      }

      return {
        schedule: schedule,
        batch: batch,
        report: report,
        formatReport: formatReport
      };
    };
  }
));