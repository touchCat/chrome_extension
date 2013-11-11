var Config, config, heat, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Config = (function(_super) {
  __extends(Config, _super);

  function Config() {
    _ref = Config.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Config.prototype.defaults = {
    token: false,
    name: null,
    task: false,
    tabid: 0,
    life: 20,
    fish: 20,
    service: true
  };

  return Config;

})(Backbone.Model);

config = new Config();

config.on('change:token', function(model, value) {
  console.log('change:token', value);
  if (value) {
    config.set('name', '');
    if (typeof socket !== "undefined" && socket !== null) {
      console.log('send token', config.get('token'));
      return socket.emit('user.kiss', {
        what: 'my ass',
        token: config.get('token')
      }, function() {
        return socket.emit('user.whoami', (function(status, res) {
          return config.set('name', res.name);
        }));
      });
    } else {
      window.socket = io.connect('http://touchday.2013.nodeknockout.com/');
      socket.on('connect', function() {
        console.log('send token', config.get('token'));
        return socket.emit('user.kiss', {
          what: 'my ass',
          token: config.get('token')
        }, function() {
          return socket.emit('user.whoami', (function(status, res) {
            return config.set('name', res.name);
          }));
        });
      });
      return socket.on('shit', (function(taskid, task) {
        return config.set('task', task);
      }));
    }
  }
});

config.on('change:task', function(model, value) {
  console.log('new task', value);
  return chrome.tabs.sendMessage(config.get('tabid'), {
    v: 'assign',
    todo: value
  });
});

config.on('change:life change:fish', function(model) {
  return chrome.extension.sendMessage({
    v: 'status',
    life: config.get('life'),
    fish: config.get('fish')
  });
});

config.on('change:service', function(model) {
  return chrome.tabs.sendMessage(config.get('tabid'), {
    v: 'service',
    value: config.get('service')
  });
});

config.on('change:tabid', function(model, tabid) {
  chrome.tabs.sendMessage(tabid, {
    v: 'active'
  });
  chrome.tabs.sendMessage(tabid, {
    v: 'assign',
    todo: config.get('task')
  });
  return chrome.tabs.sendMessage(tabid, {
    v: 'service',
    value: config.get('service')
  });
});

chrome.tabs.onActiveChanged.addListener(function(id) {
  console.log('change tab', id);
  return config.set('tabid', id);
});

chrome.tabs.onUpdated.addListener(function(id, status, tab) {
  if (tab.active) {
    console.log('update tab', id);
    return config.set('tabid', id);
  }
});

chrome.extension.onMessage.addListener(function(req, sender, sendResponse) {
  var fish, name, value;
  switch (req.v) {
    case 'start':
      return config.set('service', true);
    case 'stop':
      return config.set('service', false);
    case 'set_config':
      config.set(req.key, req.value);
      return sendResponse({
        status: 1
      });
    case 'get_config':
      value = config.get(req.key);
      if (value != null) {
        return sendResponse({
          status: 1,
          value: value
        });
      } else {
        return sendResponse({
          status: -1,
          value: false
        });
      }
      break;
    case 'task_pass':
      config.set('task', false);
      console.log('task_pass');
      return config.set('life', config.get('life') + 5);
    case 'get_status':
      return sendResponse({
        status: 1,
        life: config.get('life'),
        fish: config.get('fish'),
        name: config.get('name'),
        photo: config.get('photo')
      });
    case 'eat':
      if (req.value > 0) {
        console.log('eat eat', req.value);
        fish = config.get('fish') + req.value;
        if (fish > 100) {
          fish = 100;
        }
        return config.set('fish', fish);
      }
      break;
    case 'whoami':
      name = config.get('name');
      return sendResponse({
        status: 1,
        value: name != null ? name : false
      });
    default:
      return sendResponse({
        status: 0
      });
  }
});

(heat = function() {
  var fish, life;
  fish = config.get('fish') - 0.2;
  if (fish < 0) {
    fish = 0;
  }
  config.set('fish', fish);
  life = config.get('life');
  if (fish > 85) {
    life += 0.1;
  } else if (fish < 10) {
    life -= 0.1;
  }
  if (life > 100) {
    life = 100;
  } else if (life < 0) {
    life = 0;
  }
  config.set('life', life);
  return setTimeout(heat, 1000);
})();

/*
//@ sourceMappingURL=background.js.map
*/