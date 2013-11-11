var getPath;

$(function() {
  var fish, fish_dom, life, life_dom;
  life = 0;
  fish = 0;
  $.photo = null;
  $.service = true;
  $('#login .btn-login').on('click', function() {
    return chrome.tabs.create({
      url: "http://touchday.2013.nodeknockout.com/user/authorize"
    });
  });
  chrome.runtime.sendMessage({
    v: 'whoami'
  }, function(res) {
    if (res.value !== false) {
      $('body').addClass('passport');
      return $('#info .name').text(res.value);
    } else {
      return $('body').removeClass('passport');
    }
  });
  life_dom = Snap(".life .diagram");
  window.life_diagram = life_dom.path({
    path: getPath(0, 100, 28),
    fill: "none",
    stroke: "#ff9f16",
    strokeWidth: 8
  });
  fish_dom = Snap(".fish .diagram");
  window.fish_diagram = fish_dom.path({
    path: getPath(0, 100, 28),
    fill: "none",
    stroke: "#24df9a",
    strokeWidth: 8
  });
  chrome.runtime.sendMessage({
    v: 'get_status'
  }, function(res) {
    var fish_animate, life_animate;
    life_animate = Snap.animate(life, res.life, (function(val) {
      window.life_diagram.attr({
        path: getPath(val, 100, 28)
      });
      return $('.life .percent').text(parseInt(val, 10));
    }), 1000);
    life = res.life;
    fish_animate = Snap.animate(fish, res.fish, (function(val) {
      window.fish_diagram.attr({
        path: getPath(val, 100, 28)
      });
      return $('.fish .percent').text(parseInt(val, 10));
    }), 1000);
    fish = res.fish;
    if (res.photo) {
      $.photo = res.photo;
      $('#info .photo').css("background-image", "url('" + $.photo + "')");
    }
    return $.service = res.service;
  });
  return chrome.runtime.onMessage.addListener(function(req, sender, sendResponse) {
    var fish_animate, life_animate;
    switch (req.v) {
      case 'status':
        life_animate = Snap.animate(life, req.life, (function(val) {
          window.life_diagram.attr({
            path: getPath(val, 100, 28)
          });
          return $('.life .percent').text(parseInt(val, 10));
        }), 1000);
        life = req.life;
        fish_animate = Snap.animate(fish, req.fish, (function(val) {
          window.fish_diagram.attr({
            path: getPath(val, 100, 28)
          });
          return $('.fish .percent').text(parseInt(val, 10));
        }), 1000);
        return fish = req.fish;
    }
  });
});

getPath = function(value, total, R) {
  var S, a, alpha, path, x, y;
  S = 64 / 2;
  alpha = 360 / total * value;
  a = (90 - alpha) * Math.PI / 180;
  x = S + R * Math.cos(a);
  y = S - R * Math.sin(a);
  if (total === value) {
    path = [["M" + S, S - R], ["A" + R, R, 0, 1, 1, S - 0.01, S - R]];
  } else {
    path = [["M" + S, S - R], ["A" + R, R, 0, +(alpha > 180), 1, x, y]];
  }
  return path.join();
};

/*
//@ sourceMappingURL=popup.js.map
*/