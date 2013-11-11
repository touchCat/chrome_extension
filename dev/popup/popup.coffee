$ ->
  life = 0
  fish = 0
  $.photo = null
  $.service = on
  $('#login .btn-login').on 'click', () ->
    chrome.tabs.create({url:"http://touchday.2013.nodeknockout.com/user/authorize"})
  # $('#info .photo').on 'click', ()->
  #   if $.service
  #     chrome.runtime.sendMessage {v:'stop'}
  #   else
  #     chrome.runtime.sendMessage {v:'start'}
  #   $.service = !$.service

  chrome.runtime.sendMessage {v:'whoami'}, (res) ->
    if res.value isnt no
      $('body').addClass 'passport'
      $('#info .name').text res.value
    else
      $('body').removeClass 'passport'

  life_dom = Snap(".life .diagram")
  window.life_diagram = life_dom.path
        path: getPath(0,100,28),
        fill: "none",
        stroke: "#ff9f16",
        strokeWidth: 8

  fish_dom = Snap(".fish .diagram")
  window.fish_diagram = fish_dom.path
        path: getPath(0,100,28),
        fill: "none",
        stroke: "#24df9a",
        strokeWidth: 8

  chrome.runtime.sendMessage {v:'get_status'}, (res) ->
    life_animate = Snap.animate life, res.life, ((val) ->
      window.life_diagram.attr({path: getPath(val,100,28)})
      $('.life .percent').text(parseInt(val,10))
    ), 1000
    life = res.life
    fish_animate = Snap.animate fish, res.fish, ((val) ->
      window.fish_diagram.attr({path: getPath(val,100,28)})
      $('.fish .percent').text(parseInt(val,10))
    ), 1000
    fish = res.fish
    if res.photo
      $.photo = res.photo
      $('#info .photo').css("background-image","url('"+$.photo+"')")
    $.service = res.service

  chrome.runtime.onMessage.addListener (req, sender, sendResponse)->
    switch req.v
      when 'status'
        life_animate = Snap.animate life, req.life, ((val) ->
          window.life_diagram.attr({path: getPath(val,100,28)})
          $('.life .percent').text(parseInt(val,10))
        ), 1000
        life = req.life
        fish_animate = Snap.animate fish, req.fish, ((val) ->
          window.fish_diagram.attr({path: getPath(val,100,28)})
          $('.fish .percent').text(parseInt(val,10))
        ), 1000
        fish = req.fish

getPath = (value, total, R) ->
  S = 64 / 2
  alpha = 360 / total * value
  a = (90 - alpha) * Math.PI / 180
  x = S + R * Math.cos(a)
  y = S - R * Math.sin(a)
  if total is value
    path = [["M"+ S, S - R], ["A"+ R, R, 0, 1, 1, S - 0.01, S - R]]
  else
    path = [["M"+ S, S - R], ["A"+ R, R, 0, +(alpha > 180), 1, x, y]]
  return path.join()        