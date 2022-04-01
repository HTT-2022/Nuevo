var database = null;
var nextUser = 101;

document.addEventListener("deviceready", function(){
    // Initialize the database after the Cordova is ready.
    initDatabase();
});

function initDatabase() {
  database = window.sqlitePlugin.openDatabase({name: 'sample.db', location: 'default'});

  database.transaction(function(transaction) {
    transaction.executeSql('CREATE TABLE SampleTable (name, score)');
  });
}

function echoTest() {
  window.sqlitePlugin.echoTest(function() {
    alert('Echo test OK');
  }, function(error) {
    alert('Echo test ERROR: ' + error.message);
  });
}

function selfTest() {
  window.sqlitePlugin.selfTest(function() {
    alert('Self test OK');
  }, function(error) {
    alert('Self test ERROR: ' + error.message);
  });
}

function showCount() {
  database.transaction(function(transaction) {
    transaction.executeSql('SELECT count(*) AS recordCount FROM SampleTable', [], function(ignored, resultSet) {
        $('#result').text('RECORD COUNT: ' + resultSet.rows.item(0).recordCount);
    });
  }, function(error) {
    alert('SELECT count error: ' + error.message);
  });
}

function addRecord() {
  database.transaction(function(transaction) {
    transaction.executeSql('INSERT INTO SampleTable VALUES (?,?)', ['User '+nextUser, nextUser]);
  }, function(error) {
    alert('INSERT error: ' + error.message);
  }, function() {
    alert('INSERT OK');
    showCount();
    ++nextUser;
  });
}

function addJSONRecordsAfterDelay() {
  function getJSONObjectArray() {
    var COUNT = 100;
    var myArray = [];

    for (var i=0; i<COUNT; ++i) {
      myArray.push({name: 'User '+nextUser, score: nextUser});
      ++nextUser;
    }

    return myArray;
  }

  function getJSONAfterDelay() {
    var MY_DELAY = 150;

    var d = $.Deferred();

    setTimeout(function() {
      d.resolve(getJSONObjectArray());
    }, MY_DELAY);

    return $.when(d);
  }

  // NOTE: This is similar to the case when an application
  // fetches the data over AJAX to populate the database.
  // IMPORTANT: The application MUST get the data before
  // starting the transaction.
  getJSONAfterDelay().then(function(jsonObjectArray) {
    database.transaction(function(transaction) {
      $.each(jsonObjectArray, function(index, recordValue) {
        transaction.executeSql('INSERT INTO SampleTable VALUES (?,?)',
          [recordValue.name, recordValue.score]);
      });
    }, function(error) {
      alert('ADD records after delay ERROR');
    }, function() {
      alert('ADD 100 records after delay OK');
      showCount();
    });
  });
}

function deleteRecords() {
  database.transaction(function(transaction) {
    transaction.executeSql('DELETE FROM SampleTable');
  }, function(error) {
    alert('DELETE error: ' + error.message);
  }, function() {
    alert('DELETE OK');
    showCount();
    ++nextUser;
  });
}

document.addEventListener('deviceready', function() {
  $('#echo-test').click(echoTest);
  $('#self-test').click(selfTest);
  $('#show-count').click(showCount);
  $('#add-record').click(addRecord);
  $('#add-json-records-after-delay').click(addJSONRecordsAfterDelay);
  $('#delete-records').click(deleteRecords);
});
