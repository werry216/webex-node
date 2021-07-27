var webex = require('webex/env');
var createdRooms;
Promise.all([
  webex.rooms.create({title: 'List Rooms Example 1'}),
  webex.rooms.create({title: 'List Rooms Example 2'}),
  webex.rooms.create({title: 'List Rooms Example 3'})
])
  .then(function(r) {
    createdRooms = r;
    return webex.rooms.list({max: 3})
      .then(function(rooms) {
        var assert = require('assert');
        assert(rooms.length === 3);
        for (var i = 0; i < rooms.items.length; i+= 1) {
          assert(createdRooms.filter(function(room) {
            return room.id === rooms.items[i].id;
          }).length === 1);
        }
        return 'success';
      });
  });