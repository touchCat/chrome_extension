class Config extends Backbone.Model
  defaults:
    token: false
    name: null
    task: false
    tabid: 0
    life: 20
    fish: 20
    service: on

config = new Config()

config.on 'change:token', (model, value) ->
  console.log 'change:token', value
  if value
    config.set 'name', ''
    if socket?
      console.log 'send token', config.get('token')
      socket.emit 'user.kiss', {what: 'my ass', token: config.get('token')}, () ->
        socket.emit 'user.whoami', ((status,res) -> config.set 'name', res.name)
    else
      window.socket = io.connect('http://touchday.2013.nodeknockout.com/')
      socket.on 'connect', () ->
        console.log 'send token', config.get('token')
        socket.emit 'user.kiss', {what: 'my ass', token: config.get('token')}, () ->
          socket.emit 'user.whoami', ((status,res) -> config.set 'name', res.name)
      socket.on 'shit', ((taskid, task) -> config.set('task', task))

config.on 'change:task', (model, value) ->
  console.log 'new task', value
  chrome.tabs.sendMessage config.get('tabid'), {v: 'assign', todo: value}

config.on 'change:life change:fish', (model) ->
  chrome.extension.sendMessage
    v: 'status'
    life: config.get('life')
    fish: config.get('fish')

config.on 'change:service', (model) ->
  chrome.tabs.sendMessage config.get('tabid'), {v: 'service', value: config.get('service')}

config.on 'change:tabid', (model, tabid) ->
  chrome.tabs.sendMessage tabid, {v: 'active'}
  chrome.tabs.sendMessage tabid, {v: 'assign', todo: config.get('task')}
  chrome.tabs.sendMessage tabid, {v: 'service', value: config.get('service')}

chrome.tabs.onActiveChanged.addListener (id) ->
  console.log 'change tab', id
  config.set('tabid', id)

chrome.tabs.onUpdated.addListener (id,status,tab) ->
  if tab.active
    console.log 'update tab', id
    config.set('tabid', id)

chrome.extension.onMessage.addListener (req, sender, sendResponse)->
  switch req.v
    when 'start'
      config.set 'service', on
    when 'stop'
      config.set 'service', off
    when 'set_config'
      config.set req.key, req.value
      sendResponse {status: 1}
    when 'get_config'
      value = config.get(req.key)
      if value?
        sendResponse {status: 1, value: value}
      else
        sendResponse {status: -1, value: false}
    when 'task_pass'
      config.set('task', false)
      console.log 'task_pass'
      config.set('life', config.get('life') + 5)
    when 'get_status'
      sendResponse
        status: 1
        life: config.get('life')
        fish: config.get('fish')
        name: config.get('name')
        photo: config.get('photo')
    when 'eat'
      if req.value > 0
        console.log 'eat eat', req.value
        fish = config.get('fish') + req.value
        fish = 100 if fish > 100
        config.set('fish',fish)
    when 'whoami'
      name = config.get('name')
      sendResponse {status: 1, value: if name? then name else false}
    else
      sendResponse {status: 0}

(heat = ->
  fish = config.get('fish') - 0.2
  fish = 0 if fish < 0
  config.set('fish',fish)
  life = config.get('life')

  if fish > 85
    life += 0.1
  else if fish < 10
    life -= 0.1
  
  if life > 100
    life = 100
  else if life < 0
    life = 0
  
  config.set('life', life)

  setTimeout heat, 1000
)()