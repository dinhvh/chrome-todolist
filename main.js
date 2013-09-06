$(function () {
  setup();
});

var task_id = 1;
var focusEnabled = false;

var setup = function() {
  $('#add-button').text('Add Task');
  $('#add-button').text('+');
  $('#add-button').click(function(event) {
    addTask(task_id, '');
    task_id ++;
  });
  
  loadData(function() {
    console.log($('.task'));
    addTaskIfNeeded();
    focusEnabled = true;
  });
};

var addTaskIfNeeded = function() {
  if ($('.task').length == 0) {
    addTask(task_id, '')
    task_id ++;
    var tasktitle = $('.task input[type=text]');
    tasktitle.blur();
  }
};

var animateRemoveCell = function(task_id) {
  // start animation
  var task = $('#task-' + task_id);
  setTimeout(function() {
    task.animate({
      opacity: 0,
      marginLeft: 200
    }, 250, function() {
      task.animate({
        height: 0
      }, 250, function() {
        task.remove();
        addTaskIfNeeded();
      });
    });
  }, 500);
};

var addTask = function(task_id, title) {
  $('#list').append('<div class="task" id="task-' + task_id + '"><input type="checkbox"></input><input type="text" class="form-control" placeholder="New Task"></input></div>');
  scheduleSave();
  
  var tasktitle = $('#task-' + task_id + ' input[type=text]');
  if (focusEnabled) {
    tasktitle.focus();
  }
  tasktitle.on('input', function(the_task_id, event) {
    scheduleSave();
  }.bind(this, task_id));
  tasktitle.val(title);
  tasktitle.keypress(function(e) {
    if (e.which == 13) {
      tasktitle.blur();
    }
  });
  
  var checkbox = $('#task-' + task_id + ' input[type=checkbox]');
  checkbox.change(function(the_task_id, event) {
    if (checkbox[0].checked) {
      animateRemoveCell(the_task_id);
    }
    scheduleSave();
  }.bind(this, task_id));
};

var scheduledSave = false;

var scheduleSave = function() {
  if (scheduledSave) {
    return;
  }
  
  scheduledSave = true;
  setTimeout(function() {
    window.webkitRequestFileSystem(window.PERSISTENT, 5*1024*1024*1024, function(fs) {
      fs.root.getFile('contents', {create: true}, function(createdEntry) {
        createdEntry.createWriter(function(writer) {
          var blob = new Blob([serializedData()], {type: 'text/plain'});
          writer.onwriteend = function() {
            console.log('truncated');
            writer.onwriteend = function() {
              console.log('written');
            };
            writer.write(blob);
          };
          writer.truncate(0);
        });
      });
    });
    //console.log(serializeData());
    scheduledSave = false;
  }, 2000);
};

var loadData = function(callback) {
  window.webkitRequestFileSystem(window.PERSISTENT, 5*1024*1024*1024, function(fs) {
    fs.root.getFile('contents', {}, function(fileEntry) {
      fileEntry.file(function(file) {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(oFREvent) {
          fillWithSerializedData(oFREvent.target.result);
          callback();
        };
      }, function() {
        callback();
      });
    }, function() {
      callback();
    });
  });
};

var serializedData = function() {
  var tasktitles = $('.task input[type=text]');
  var data = [];
  for(var i = 0 ; i < tasktitles.length ; i ++) {
    data.push(tasktitles[i].value);
  }
  
  return JSON.stringify(data);
};

var fillWithSerializedData = function(data) {
  console.log(data);
  var array = JSON.parse(data);
  array.forEach(function(value, idx) {
    addTask(task_id, value);
    task_id ++;
  });
  var tasktitle = $('.task input[type=text]');
  tasktitle.blur();
};
