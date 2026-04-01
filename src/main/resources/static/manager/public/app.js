(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("app.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AppController = function AppController($scope, $router, $location, $translate, $sce, roleAdminList, Profile, PlatformInfos, $window) {
  _classCallCheck(this, AppController);

  $router.config([{
    path: '/',
    redirectTo: '/home'
  }, {
    path: '/home',
    component: 'home'
  }, {
    path: '/analytics/:role',
    component: 'analytics'
  }, {
    path: '/orgs/:org',
    component: 'orgs'
  }, {
    path: '/org/:org/:tab',
    component: 'org'
  }, {
    path: '/roles/:role',
    component: 'roles'
  }, {
    path: '/role/:role/:tab',
    component: 'role'
  }, {
    path: '/delegations',
    component: 'delegations'
  }, {
    path: '/browse/:id/users',
    component: 'users'
  }, {
    path: '/users/:id/:tab',
    component: 'user'
  }, {
    path: '/users/add',
    component: 'newUser'
  }, {
    path: '/logs',
    component: 'logs'
  }]);

  $scope.isActive = function (routes) {
    return routes.some(function (route) {
      return $location.$$path.indexOf(route) === 1;
    });
  };

  $scope.isSuperUser = function (user) {
    return user.adminRoles && user.adminRoles.SUPERUSER;
  };

  var profilResource = Profile.get(function (p) {
    $scope.profile = p.roles.indexOf('SUPERUSER') === -1 ? 'DELEGATED' : 'SUPERUSER';
  });
  profilResource.$promise.then(function () {}, function (error) {
    if (error.status === 419) {
      $window.location.href = '/console';
    }
  });
  $scope.platformInfos = PlatformInfos.get(function (pi) {});
  $scope.platformInfos.$promise.then(function () {}, function (error) {
    if (error.status === 419) {
      $window.location.href = '/console';
    }
  });

  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };

  $scope.isProtectedRole = function (role) {
    return roleAdminList().indexOf(role.cn) !== -1;
  };

  $scope.$translate = $translate;
};

_defineProperty(AppController, "$inject", ['$scope', '$router', '$location', '$translate', '$sce', 'roleAdminList', 'Profile', 'PlatformInfos', '$window']);

var StandaloneController = function StandaloneController($injector, $window, $http, $scope, Org) {
  _classCallCheck(this, StandaloneController);

  if (!$window.org) {
    $scope.org = new Org();
    return;
  }

  $scope.org = $window.org;
  $scope.users = $window.org.members;
  $scope.isReferentOrSuperUser = $window.isReferentOrSuperUser;
  $scope.gdprAllowAccountDeletion = $window.gdprAllowAccountDeletion;
  $scope.deleteURI = $injector.get('CONSOLE_BASE_PATH') + 'account/gdpr/delete';
  var i18n = {};
  $injector.get('translate')('editUserDetailsForm.deleteConfirm', i18n);
  $injector.get('translate')('editUserDetailsForm.deleteFail', i18n);

  $scope.deleteUser = function () {
    if (!$window.confirm(i18n.deleteConfirm)) return false;
    $http.post($scope.deleteURI).then(function success(response) {
      $window.location.href = '/logout';
    }, function error() {
      $window.alert(i18n.deleteFail);
    });
  };
};

_defineProperty(StandaloneController, "$inject", ['$injector', '$window', '$http', '$scope', 'Orgs', 'User']);

angular.module('manager', ['ngResource', 'ngNewRouter', 'ngSanitize', 'inline', 'localytics.directives', 'flash', 'angularUtils.directives.dirPagination', 'pascalprecht.translate']).controller('AppController', AppController).controller('StandaloneController', StandaloneController).constant('CONSOLE_BASE_PATH', '/console/').constant('CONSOLE_PRIVATE_PATH', '/console/private/').constant('CONSOLE_PUBLIC_PATH', '/console/public/').constant('ANALYTICS_SERVICES_PATH', '/analytics/ws/').config(['$componentLoaderProvider', '$translateProvider', '$locationProvider', 'paginationTemplateProvider', 'CONSOLE_BASE_PATH', '$qProvider', '$httpProvider', function ($componentLoader, $translate, $location, paginationTemplate, $uri, $qP, $httpProvider) {
  $componentLoader.setTemplateMapping(function (name) {
    return 'components/' + name + '/' + name + '.tpl.html';
  });
  $translate.useSanitizeValueStrategy('escape').useStaticFilesLoader({
    prefix: $uri + 'manager/public/lang/',
    suffix: '.json'
  }).registerAvailableLanguageKeys(['en', 'fr', 'de', 'es', 'nl'], {
    'en_*': 'en',
    'fr_*': 'fr',
    'de_*': 'de',
    'es_*': 'es',
    'nl_*': 'nl',
    '*': 'en'
  }).determinePreferredLanguage().fallbackLanguage('en');
  $location.html5Mode({
    enabled: true,
    requireBase: false
  });
  paginationTemplate.setPath('templates/dirPagination.tpl.html');
  $qP.errorOnUnhandledRejections(false); // see https://github.com/georchestra/georchestra/issues/1695 {{{

  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.get = {};
  } // disable IE ajax request caching


  $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT'; // extra

  $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
  $httpProvider.defaults.headers.get.Pragma = 'no-cache'; // }}}
}]).filter('dateFormat', ['$translate', function ($translate) {
  moment.locale($translate.use());
  return function (date, format) {
    var m = moment(date);
    return "<span title=\"".concat(m.format('lll'), "\">").concat(!format ? m.fromNow() : m.format(format), "</span>");
  };
}]).directive('shortname', function () {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function link(scope, elm, attrs, ctrl) {
      var regexp = 'shortnameLower' in attrs ? /^[A-Za-z0-9-_]+$/ : /^[A-Z0-9-_]+$/;

      var alphanum = function alphanum(v) {
        return v && v.match(regexp);
      };

      ctrl.$validators.shortname = alphanum;
    }
  };
}).directive('ngConfirmClick', [function () {
  return {
    link: function link(scope, element, attr) {
      var msg = attr.ngConfirmClick || 'Are you sure?';
      var clickAction = attr.confirmedClick;
      element.bind('click', function (event) {
        if (window.confirm(msg)) {
          scope.$eval(clickAction);
        }
      });
    }
  };
}]);

require('components/analytics/analytics');

require('components/orgs/orgs');

require('components/org/org');

require('components/roles/roles');

require('components/role/role');

require('components/delegations/delegations');

require('components/home/home');

require('components/browse/browse');

require('components/logs/logs');

require('components/newUser/newUser');

require('components/stats/stats');

require('components/logger/logger');

require('components/user/user');

require('components/users/users');

require('templates/dirPagination.tpl');
});

;require.register("components/analytics/analytics.es6", function(exports, require, module) {
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

require('components/analytics/analytics.tpl');

require('components/date/date');

require('services/analytics');

var AnalyticsController = /*#__PURE__*/function () {
  function AnalyticsController($injector, $routeParams) {
    var _this = this;

    _classCallCheck(this, AnalyticsController);

    this.$injector = $injector;
    this.i18n = {};
    this.$injector.get('translate')('analytics.all', this.i18n);
    this.role = $routeParams.role || 'all';
    this.roles = this.$injector.get('Role').query(function () {
      _this.roles = [{
        cn: 'all'
      }].concat(_this.roles).map(function (g) {
        g.label = _this.i18n[g.cn] || g.cn;
        return g;
      });
    });
    var date = this.$injector.get('date');
    this.date = {
      start: date.getDefault(),
      end: date.getEnd()
    };
    this.data = {};
    this.config = {
      layers: ['layer', 'count'],
      requests: ['date', 'count'],
      extractions: ['layer', 'count']
    };
    this.load(this.role !== 'all' ? this.role : undefined);
  }

  _createClass(AnalyticsController, [{
    key: "load",
    value: function load(role) {
      var i18n = {};
      this.$injector.get('translate')('analytics.errorload', i18n);
      this.$injector.get('translate')('users.roleUpdateError', i18n);
      var Flash = this.$injector.get('Flash');
      var Analytics = this.$injector.get('Analytics');
      var err = Flash.create.bind(Flash, 'danger', i18n.errorload);
      var options = {
        service: 'combinedRequests.json',
        startDate: this.date.start,
        endDate: this.date.end
      };

      if (role && role !== 'all') {
        options.role = role;
      }

      this.requests = Analytics.get(options, function () {}, err);
      this.requestsOptions = _objectSpread({}, options);
      this.requestsOptions.service = 'combinedRequests.csv';

      var usageOptions = _objectSpread({}, options, {
        service: 'layersUsage.json',
        limit: 10
      });

      this.layers = Analytics.get(usageOptions, function () {}, err);
      this.usageOptions = _objectSpread({}, usageOptions);
      delete this.usageOptions.limit;
      this.usageOptions.service = 'layersUsage.csv';

      var extractionOptions = _objectSpread({}, options, {
        service: 'layersExtraction.json',
        limit: 10
      });

      this.extractions = Analytics.get(extractionOptions, function () {}, err);
      this.extractionOptions = _objectSpread({}, extractionOptions);
      delete this.extractionOptions.limit;
      this.extractionOptions.service = 'layersExtraction.csv';
    }
  }, {
    key: "setRole",
    value: function setRole() {
      var $router = this.$injector.get('$router');
      $router.navigate($router.generate('analytics', {
        role: this.role
      }));
    }
  }]);

  return AnalyticsController;
}();

AnalyticsController.$inject = ['$injector', '$routeParams', 'Analytics'];
angular.module('manager').controller('AnalyticsController', AnalyticsController);
});

;require.register("components/area/area.es6", function(exports, require, module) {
"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/area/area.tpl');

var buildStyle = function buildStyle(fillColor, strokeColor, width) {
  return new ol.style.Style({
    fill: new ol.style.Fill({
      color: fillColor
    }),
    stroke: new ol.style.Stroke({
      color: strokeColor,
      width: width || 1
    })
  });
};

var highlightStyle = buildStyle([255, 0, 0, 0.5], [255, 0, 0, 0.2]);

var highlight = function highlight(feature) {
  feature.setStyle(highlightStyle);
  setTimeout(function () {
    return feature.setStyle();
  }, 250);
  return feature;
};

var AreaController = /*#__PURE__*/function () {
  function AreaController($injector, $http, $scope) {
    _classCallCheck(this, AreaController);

    this.$injector = $injector;
    this.$scope = $scope;
    var translate = $injector.get('translate');
    this.i18n = {};
    translate('area.updated', this.i18n);
    translate('area.error', this.i18n);
    this.canExport = window.Blob && window.FileReader;
  }

  _createClass(AreaController, [{
    key: "$onInit",
    value: function $onInit() {
      this.maponly = this.readonly === 'true';
      var $http = this.$injector.get('$http');
      var CONFIG_URI = this.$injector.get('CONSOLE_PUBLIC_PATH') + 'orgs/areaConfig.json';
      var promises = [$http.get(CONFIG_URI).then(function (r) {
        return r.data;
      })];
      this.canExport = this.canExport && this.item.id;

      if (this.item.$promise) {
        promises.push(this.item.$promise);
      }

      this.$injector.get('$q').all(promises).then(this.initialize.bind(this));
    }
  }, {
    key: "initialize",
    value: function initialize(resps) {
      var _this = this;

      var _resps = _slicedToArray(resps, 1),
          config = _resps[0];

      this.ids = this.item.cities || [];
      this.groups = [];
      this.collection = new ol.Collection();
      var vector = new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: function style(f) {
          return _this.collection.getArray().indexOf(f) >= 0 ? buildStyle([0, 159, 227, 0.2], [0, 159, 227, 1], 1.5) : buildStyle([255, 255, 255, 0.1], [0, 0, 0, 0.2]);
        }
      });
      this.source = vector.getSource();
      var map = new ol.Map({
        target: document.querySelector('.map'),
        layers: [new ol.layer.Tile({
          source: new ol.source.OSM({
            attributions: null
          })
        }), vector],
        logo: false
      });
      this.map = map;
      this.vector = vector;

      if (!this.maponly) {
        map.on('click', function (e) {
          return map.forEachFeatureAtPixel(e.pixel, function (f) {
            if (_this.collection.getArray().indexOf(f) >= 0) {
              _this.collection.remove(f);

              _this.updateSelection([], true);
            } else {
              _this.updateSelection([f], true);
            }
          });
        });
      }

      var format = new ol.format.GeoJSON();
      this.loading = true;
      this.$injector.get('$http').get('/console/public/area.geojson').then(function (response) {
        return response.data;
      }).then(function (json) {
        var conf = {
          dataProjection: 'EPSG:4326',
          featureProjection: map.getView().getProjection()
        };
        var selected = [];
        json.features.forEach(function (f) {
          f.id = f.properties[config.areas.key].toString();
        });
        vector.getSource().addFeatures(format.readFeatures(json, conf));
        vector.getSource().forEachFeature(function (f) {
          var group = f.get(config.areas.group);

          if (group === undefined) {
            throw new Error("Cannot get AreaGroup \"".concat(config.areas.group, "\" in provided geojson. Check datadir config."));
          }

          if (_this.groups.indexOf(group) < 0) {
            _this.groups.push(group);
          }

          var displayName = f.get(config.areas.value);

          if (displayName === undefined) {
            throw new Error("Cannot get AreaValue \"".concat(config.areas.value, "\" in provided geojson. Check datadir config."));
          }

          f.set('_label', displayName.toString() || '');
          f.set('_group', group);
          if (_this.ids.indexOf(f.getId()) >= 0) selected.push(f);
        });

        _this.map.set('config', config.map);

        if (!config.map) {
          _this.map.getView().fit(vector.getSource().getExtent(), map.getSize());
        } else {
          _this.map.getView().setCenter(ol.proj.fromLonLat(config.map.center));

          _this.map.getView().setZoom(config.map.zoom);
        }

        if (selected.length > 0) {
          var extent = ol.extent.createEmpty();
          selected.forEach(function (f) {
            return ol.extent.extend(extent, f.getGeometry().getExtent());
          });

          _this.map.getView().fit(extent, map.getSize());
        }

        _this.updateSelection(selected);

        _this.loading = false;
      })["catch"](function (ex) {
        return console.error(ex);
      });
      var dragBox = new ol.interaction.DragBox({
        condition: ol.events.condition.always
      });
      map.getInteractions().push(dragBox);
      dragBox.setActive(this.draw = false);
      dragBox.on('boxend', function () {
        var selected = [];
        vector.getSource().forEachFeatureIntersectingExtent(dragBox.getGeometry().getExtent(), function (feature) {
          selected.push(feature);
        });

        _this.updateSelection(selected, true);

        dragBox.setActive(_this.draw = false);
      });

      var buildRE = function buildRE(search) {
        search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // eslint-disable-line

        return new RegExp('(' + search.split(' ').join('|') + ')', 'gi');
      };

      new autoComplete({
        // eslint-disable-line
        selector: document.querySelector('.search'),
        minChars: 3,
        source: function source(term, response) {
          var matches = [];
          var re = buildRE(term);
          vector.getSource().getFeatures().forEach(function (f) {
            if (f.get('_label').match(re)) {
              matches.push(f);
            }
          });
          response(matches);
        },
        renderItem: function renderItem(f, search) {
          return '<div class="autocomplete-suggestion"' + 'data-val="' + f.get('_label') + '"' + 'data-id="' + f.getId() + '">' + '<span>' + (_this.collection.getArray().indexOf(f) >= 0 ? '✓' : '') + '</span>' + f.get('_label').replace(buildRE(search), '<b>$1</b>') + '</div>';
        },
        onSelect: function onSelect(e, term, item) {
          var f = vector.getSource().getFeatureById(item.getAttribute('data-id'));

          if (_this.collection.getArray().indexOf(f) >= 0) {
            _this.collection.remove(f);

            _this.updateSelection([], true);
          } else {
            _this.updateSelection([f], true);
          }

          f.setStyle(buildStyle([255, 0, 0, 0.5], [255, 0, 0, 0.2]));
          setTimeout(function () {
            return f.setStyle();
          }, 350);
        }
      });

      this.selectBBOX = function () {
        dragBox.setActive(_this.draw = true);
      };

      this.selectBy = function () {
        if (_this.group === 'all') {
          _this.updateSelection(vector.getSource().getFeatures());

          return;
        }

        if (_this.group === 'none') {
          _this.updateSelection([]);

          _this.group = '';
          return;
        }

        var selected = vector.getSource().getFeatures().filter(function (f) {
          return f.get('_group') === _this.group;
        });

        _this.updateSelection(selected);
      };
    }
  }, {
    key: "updateSelection",
    value: function updateSelection(features) {
      var _this2 = this;

      var cumulative = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      this.$injector.get('$timeout')(function () {
        if (!cumulative) _this2.collection.clear();

        var uniques = _this2.collection.getArray().concat(features).filter(function (item, index, self) {
          return index === self.indexOf(item);
        });

        _this2.collection.clear();

        _this2.collection.extend(uniques);

        _this2.ids = uniques.map(function (f) {
          return f.getId();
        });
        features.map(highlight);

        _this2.collection.getArray().sort(function (a, b) {
          return a.get('_label').localeCompare(b.get('_label'));
        });

        _this2.vector.changed();
      });
    }
  }, {
    key: "removeFromSelection",
    value: function removeFromSelection(feature) {
      highlight(feature);
      this.collection.remove(feature);
      this.ids = this.collection.getArray().map(function (f) {
        return f.getId();
      });
    }
  }, {
    key: "save",
    value: function save() {
      var _this3 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.item.cities = this.ids;
      this.item.$update(function () {
        $httpDefaultCache.removeAll();
        flash.create('success', _this3.i18n.updated);
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "export",
    value: function _export() {
      var a = document.createElement('a');
      a.href = window.URL.createObjectURL(new Blob([this.ids.join('\n')], {
        type: 'text/csv'
      }));
      a.download = 'export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, {
    key: "import",
    value: function _import() {
      var _this4 = this;

      var fileInput = document.createElement('input');
      var reader = new window.FileReader();
      fileInput.type = 'file';
      fileInput.accept = 'text/csv';
      this.ids = [];
      this.collection.clear();

      reader.onload = function () {
        return _this4.$scope.$apply(function () {
          reader.result.replace(/\r/g, '').split('\n').forEach(function (line) {
            var _line$split = line.split(/,|;/),
                _line$split2 = _slicedToArray(_line$split, 1),
                id = _line$split2[0];

            var f = _this4.source.getFeatureById(id);

            if (!f) return;

            _this4.collection.push(highlight(f));

            _this4.ids.push(id);
          });
        });
      };

      fileInput.addEventListener('change', function () {
        return reader.readAsText(fileInput.files[0]);
      });
      fileInput.click();
    }
  }]);

  return AreaController;
}();

_defineProperty(AreaController, "$inject", ['$injector', '$http', '$scope']);

angular.module('manager').component('areas', {
  bindings: {
    readonly: '=',
    item: '=',
    callback: '='
  },
  controller: AreaController,
  controllerAs: 'area',
  templateUrl: 'components/area/area.tpl.html'
});
});

;require.register("components/browse/browse.es6", function(exports, require, module) {
"use strict";

require("components/browse/browse.tpl");

require("services/roles");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BrowseController = /*#__PURE__*/function () {
  function BrowseController($injector) {
    _classCallCheck(this, BrowseController);

    this.$injector = $injector;
    this.pendingCount = 0;
    var PROTECTED = this.$injector.get('readonlyRoleList');

    this.filterRole = function (protecteds, role) {
      return protecteds ^ !PROTECTED.includes(role);
    }; // Rebind method for outer use


    this["protected"] = this["protected"].bind(this);
    this.unprotected = this.unprotected.bind(this);
  }

  _createClass(BrowseController, [{
    key: "$onInit",
    value: function $onInit() {
      var roleAdminList = this.$injector.get('roleAdminList');

      if (this.roles.$promise) {
        this.$injector.get('$q').all([this.roles.$promise, this.activePromise]).then(this.initialize.bind(this, roleAdminList));
      } else {
        this.initialize(roleAdminList);
      }
    }
  }, {
    key: "initialize",
    value: function initialize(roleAdminList) {
      var _this = this;

      this.activeRole = this.activePromise.$$state.value;
      var index = {};
      this.q = this.q || '';
      this.roles.forEach(function (role) {
        index[role.cn] = role;
      });
      this.index = index;
      var fullAdminList = roleAdminList();
      this.adminList = [];

      for (var idx in this.index) {
        var role = this.index[idx];

        if (fullAdminList.indexOf(role.cn) >= 0) {
          this.adminList.push(role);
        }
      }

      this.favoriteRole = this.favoriteRole.bind(this);
      this.$injector.get('User').query(function (users) {
        return _this.pendingCount = users.filter(function (u) {
          return u.pending;
        }).length;
      });
    }
  }, {
    key: "favoriteRole",
    value: function favoriteRole(role) {
      return role.isFavorite && this.adminList.indexOf(role) === -1;
    }
  }, {
    key: "createRole",
    value: function createRole() {
      var $location = this.$injector.get('$location');
      $location.search('new', 'role');
    }
  }, {
    key: "protected",
    value: function _protected(role) {
      return this.filterRole(true, role.cn);
    }
  }, {
    key: "unprotected",
    value: function unprotected(role) {
      return this.filterRole(false, role.cn);
    }
  }]);

  return BrowseController;
}();

_defineProperty(BrowseController, "$inject", ['$injector']);

angular.module('manager').component('browse', {
  bindings: {
    roles: '=',
    activePromise: '=',
    index: '=?'
  },
  controller: BrowseController,
  controllerAs: 'roles',
  templateUrl: 'components/browse/browse.tpl.html'
});
});

;require.register("components/date/date.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/date/date.tpl');

var DateController = /*#__PURE__*/function () {
  function DateController($injector, $scope, $element) {
    var _this = this;

    _classCallCheck(this, DateController);

    this.date = $injector.get('date');
    this.options = ['day', 'week', 'month', '3month', 'year', 'custom'].map(function (x) {
      return {
        value: x,
        label: 'date.' + x
      };
    });
    this.option = this.options[this.options.length - 2];
    $scope.$watch('date.model.start', function (newVal, oldVal) {
      if (!newVal || _this.option.value === 'custom') {
        return;
      }

      _this.option = _this.options.filter(function (x) {
        return _this.date.getFromDiff(x.value) === newVal;
      })[0];
    }); // Reload on custom date changes

    var dateChanged = function dateChanged(val, old) {
      if (!_this.option) {
        return;
      }

      if (_this.option.value === 'custom' && val !== old) {
        _this.callback();
      }
    };

    $scope.$watch('date.model.start', dateChanged);
    $scope.$watch('date.model.end', dateChanged);
    $element.find('.input-daterange').datepicker({
      format: 'yyyy-mm-dd'
    });
  }

  _createClass(DateController, [{
    key: "change",
    value: function change() {
      if (this.option.value !== 'custom') {
        this.model.start = this.date.getFromDiff(this.option.value);
      }

      this.callback();
    }
  }]);

  return DateController;
}();

_defineProperty(DateController, "$inject", ['$injector', '$scope', '$element']);

angular.module('manager').component('date', {
  bindings: {
    model: '=',
    callback: '&'
  },
  controller: DateController,
  controllerAs: 'date',
  templateUrl: 'components/date/date.tpl.html'
}).directive('datepicker', function () {
  return {
    require: 'ngModel',
    link: function link(scope, elm, attrs, ctrl) {
      elm.datepicker({
        format: 'yyyy-mm-dd'
      });
    }
  };
});
});

;require.register("components/delegations/delegations.es6", function(exports, require, module) {
"use strict";

require("components/delegations/delegations.tpl");

require("services/delegations");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DelegationsController = function DelegationsController(Delegations, Orgs) {
  var _this = this;

  _classCallCheck(this, DelegationsController);

  this.delegations = Delegations.query();
  this.orgs = {};
  Orgs.query({
    logos: false
  }, function (orgs) {
    return orgs.forEach(function (org) {
      return _this.orgs[org.id] = org;
    });
  });
  this.q = '';
  this.itemsPerPage = 15;
};

_defineProperty(DelegationsController, "$inject", ['Delegations', 'Orgs']);

angular.module('manager').controller('DelegationsController', DelegationsController);
});

;require.register("components/home/home.es6", function(exports, require, module) {
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/home/home.tpl');

var HomeController = function HomeController($injector) {
  var _this = this;

  _classCallCheck(this, HomeController);

  var EXPIRED_ROLE = $injector.get('expiredRole');
  this.$injector = $injector;
  $injector.get('Role').query(function (roles) {
    _this.expired = roles.find(function (r) {
      return r.cn === EXPIRED_ROLE;
    });
  });
  this.pendingCount = 0;
  $injector.get('User').query(function (users) {
    _this.pendingCount = users.filter(function (u) {
      return u.pending;
    }).length;
  });
  this.i18n = {};
  $injector.get('translate')('analytics.errorload', this.i18n);
  var flash = $injector.get('Flash');
  $injector.get('PlatformInfos').get().$promise.then(function (platformInfos) {
    if (platformInfos.analyticsEnabled) {
      var Analytics = $injector.get('Analytics');
      var options = {
        service: 'distinctUsers',
        startDate: $injector.get('date').getFromDiff('day'),
        endDate: $injector.get('date').getEnd()
      };
      _this.connected = Analytics.get(options, function () {}, function () {
        flash.create('danger', _this.i18n.errorload);
      });
      _this.requests = Analytics.get(_objectSpread({}, options, {
        service: 'combinedRequests.json',
        startDate: $injector.get('date').getFromDiff('week')
      }), function () {}, function () {
        flash.create('danger', _this.i18n.errorload);
      });
    }
  });
};

_defineProperty(HomeController, "$inject", ['$injector']);

angular.module('manager').controller('HomeController', HomeController);
});

;require.register("components/imageinput/imageinput.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/imageinput/imageinput.tpl');

var ImageinputController = /*#__PURE__*/function () {
  function ImageinputController($element, $scope) {
    _classCallCheck(this, ImageinputController);

    this.$element = $element;
    this.$scope = $scope;
  }

  _createClass(ImageinputController, [{
    key: "$onInit",
    value: function $onInit() {
      var _this = this;

      if (!window.FileReader) return;
      var reader = new window.FileReader();
      var fileinput = this.$element.find('.image-input');
      fileinput.on('change', function () {
        var file = fileinput[0].files[0];
        reader.addEventListener('load', function () {
          return _this.$scope.$apply(function () {
            return _this.setValue(reader.result.split(',')[1]);
          });
        });
        file && reader.readAsDataURL(file);
      }); // Initial value

      var setValue = function setValue() {
        return _this.value = _this.model ? _this.model[_this.attribute] : null;
      };

      if (this.model && this.model.$promise) this.model.$promise.then(setValue);else setValue();
    }
  }, {
    key: "delete",
    value: function _delete() {
      this.setValue('');
    }
  }, {
    key: "setValue",
    value: function setValue(value) {
      this.value = value;
      if (this.model) this.model[this.attribute] = value;
      if (this.target) document.querySelector(this.target).value = value;
    }
  }]);

  return ImageinputController;
}();

_defineProperty(ImageinputController, "$inject", ['$element', '$scope']);

angular.module('manager').component('imageinput', {
  bindings: {
    model: '=',
    attribute: '=',
    target: '='
  },
  controller: ImageinputController,
  controllerAs: 'imageinput',
  templateUrl: 'components/imageinput/imageinput.tpl.html'
});
});

;require.register("components/logger/logger.es6", function(exports, require, module) {
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/logger/logger.tpl');

var LoggerController = /*#__PURE__*/function () {
  function LoggerController($element, $scope, $injector) {
    _classCallCheck(this, LoggerController);

    this.$injector = $injector;
    this.$element = $element;
    this.$scope = $scope;
  }

  _createClass(LoggerController, [{
    key: "$onInit",
    value: function $onInit() {
      var _this = this;

      this.itemsPerPage = 15;
      this.i18n = {};
      ['error', 'alltarget', 'allsender', 'alltype', 'added', 'removed', 'set', 'replace', 'to', 'clear', 'pendingusercreated', 'pendinguserrefused', 'pendinguseraccepted', 'pendingorgcreated', 'pendingorgrefused', 'pendingorgaccepted', 'roledeleted', 'roldecreated', 'orgcreated', 'orgdeleted', 'userpasswordchanged', 'usercreated', 'userdeleted', 'system', 'custom', 'roleadded', 'roleremoved', 'emailrecoverysent', 'rolecreated', 'oauth2usercreated'].forEach(function (tr) {
        return _this.$injector.get('translate')('logs.' + tr, _this.i18n);
      }); // manage query params to get user's or complete logs

      var typeQuery = 'Logs';
      var params = {
        limit: 500,
        page: 0
      };

      if (this.user) {
        params.id = this.user;
        typeQuery = 'UserLogs';
      }

      this.getCitiesLog = function (log) {
        var res = '';
        res += log.changed.added ? "".concat(log.changed.added, " ").concat(this.i18n.added).concat(log.changed["new"] ? ": ".concat(log.changed["new"], ".") : '.') : '';
        res += log.changed.removed ? "".concat(log.changed.removed, " ").concat(this.i18n.removed).concat(log.changed.old ? ": ".concat(log.changed.old, ".") : '.') : '.';
        return res;
      };

      this.getAttrLog = function (log) {
        var res = '';

        if (log.changed.field === 'logo') {
          res += log.changed["new"] ? this.i18n.set : this.i18n.clear;
          res = log.changed.old && log.changed["new"] ? this.i18n.replace : res;
        } else {
          res += log.changed["new"] && !log.changed.old ? "".concat(this.i18n.set, " ").concat(log.changed["new"], ".") : '';
          res += log.changed.old && !log.changed["new"] ? "".concat(this.i18n.clear, " ").concat(log.changed.old, ".") : '';
          res += log.changed.old && log.changed["new"] ? "".concat(this.i18n.replace, " ").concat(log.changed.old, " ").concat(this.i18n.to, " ").concat(log.changed["new"], ".") : '';
        }

        return res;
      };

      this.logs = this.$injector.get(typeQuery).query(params, function () {
        // transform each logs changed value into json to find info during html construction
        _this.logs.forEach(function (l) {
          l.changed = JSON.parse(l.changed); // message

          if (l.type === 'EMAIL_SENT') {
            l.title = 'msg.sent';
          } // attributs


          if (l.type.indexOf('_ATTRIBUTE_CHANGED') >= 0 && l.changed) {
            l.title = l.changed.field === 'cities' ? _this.getCitiesLog(l) : _this.getAttrLog(l);
            l.changed.fieldI18nKey = l.type.split('_').shift().toLowerCase() + '.' + l.changed.field;
          } else {
            l.title = _this.i18n[l.type.split('_').join('').toLowerCase()];
          } // role


          if (l.type.indexOf('CUSTOM') >= 0 || l.type.indexOf('SYSTEM') >= 0) {
            // get type for a role as custom or system
            var i18nType = _this.i18n[l.type.split('_')[0].toLowerCase()]; // action added or removed


            var i18nAction = _this.i18n[l.type.split('_').slice(1, 3).join('').toLowerCase()];

            l.title = "".concat(i18nType, " ").concat(l.changed?.field, " ").concat(i18nAction, " ").concat(l.target);
          } // get icon name


          var iconName = '';

          if (l.type.indexOf('CREATED') > -1 || l.type.indexOf('ADDED') > -1) {
            iconName = l.type.indexOf('PENDING') > -1 ? 'plus' : 'plus-sign';
          } else if (l.type.indexOf('REFUSED') > -1) {
            iconName = 'remove';
          } else if (l.type.indexOf('ACCEPTED') > -1) {
            iconName = 'ok';
          } else if (l.type.indexOf('DELETED') > -1 || l.type.indexOf('REMOVED') > -1) {
            iconName = 'minus-sign';
          } else {
            iconName = 'edit';
          }

          l.icon = iconName;
        });

        var extract = function extract(key) {
          return _toConsumableArray(new Set(_this.logs.map(function (l) {
            return l[key];
          })));
        };

        _this.senders = [{
          key: 'all',
          value: _this.i18n.allsender
        }].concat(extract('admin').map(function (g) {
          return {
            key: g,
            value: g
          };
        }));
        _this.types = [{
          key: 'all',
          value: _this.i18n.alltype
        }].concat(extract('type').map(function (g) {
          return {
            key: g,
            value: g
          };
        }));
        _this.targets = [{
          key: 'all',
          value: _this.i18n.alltarget
        }].concat(extract('target').map(function (g) {
          return {
            key: g,
            value: g
          };
        }));
      }, function () {
        _this.$injector.get('Flash').create('danger', _this.i18n.error);
      });
      this.target = 'all';
      this.type = 'all';
      this.admin = 'all';
      this.date = {
        start: this.$injector.get('date').getDefault(),
        end: this.$injector.get('date').getEnd()
      }; // get all orgs infos and orgs name

      this.orgsId = {};
      this.$injector.get('Orgs').query({
        logos: false
      }, function (orgs) {
        orgs.forEach(function (org) {
          _this.orgsId[org.id] = org.name;
        });
        _this.orgs = orgs.map(function (o) {
          return o.name;
        });
      }); // get all role

      this.roles = [];
      this.$injector.get('Role').query(function (roles) {
        _this.roles = roles.map(function (role) {
          return role.cn;
        });
      }); // get all users

      this.users = [];
      this.$injector.get('User').query(function (users) {
        _this.users = users.map(function (user) {
          return user.uid;
        });
      });
    } // get log info and return log target type or empty string

  }, {
    key: "getType",
    value: function getType(log) {
      var type = '';

      if (log && this.roles && this.orgsId && this.users && this.orgs) {
        if (log.type.indexOf('DELETED') > -1 || log.type.indexOf('REFUSED') > -1) {
          // avoid to create link for removed items
          return type;
        } else if (this.roles.indexOf(log.target) > -1) {
          return 'ROLE';
        } else if (this.orgsId[log.target]) {
          return 'ORG';
        } else if (this.users.indexOf(log.target) > -1) {
          return 'USER';
        }
      }

      return type;
    }
  }, {
    key: "isFiltered",
    value: function isFiltered() {
      return this.admin !== 'all' || this.type !== 'all' || this.target !== 'all' || this.date.start !== this.$injector.get('date').getDefault() || this.date.end !== this.$injector.get('date').getEnd();
    }
  }, {
    key: "openLog",
    value: function openLog(log) {
      // remove old log if not already deleted
      if (this.log) {
        delete this.log;
      } // get messages for this user


      if (log && log.changed) {
        if (log.changed.sender) {
          // only for mail
          log.trusted = this.$injector.get('$sce').trustAsHtml(log.changed.body);
        }

        this.log = log;
      }
    }
  }, {
    key: "closeLog",
    value: function closeLog() {
      // remove log to avoir wrong behavior when log changed
      delete this.log;
    }
  }, {
    key: "reset",
    value: function reset() {
      this.admin = 'all';
      this.type = 'all';
      this.target = 'all';
      this.date.start = this.$injector.get('date').getDefault();
      this.date.end = this.$injector.get('date').getEnd();
    }
  }]);

  return LoggerController;
}();

_defineProperty(LoggerController, "$inject", ['$element', '$scope', '$injector']);

var filterLogs = function filterLogs() {
  return function (logs, type, admin, target, date) {
    if (!logs) {
      return;
    }

    var filtered = logs.filter(function (log) {
      var valid = true;

      if (type !== 'all' && log.type !== type) {
        valid = false;
      }

      if (admin !== 'all' && log.admin !== admin) {
        valid = false;
      }

      if (target !== 'all' && log.target !== target) {
        valid = false;
      }

      if (date && (moment(log.date).isBefore(date.start) || moment(log.date).isAfter(date.end))) {
        valid = false;
      }

      return valid;
    });
    return filtered;
  };
};

var logDateFilter = function logDateFilter() {
  return function (date) {
    return moment(date).format('YYYY-MM-DD HH:mm');
  };
};

angular.module('manager').component('logger', {
  bindings: {
    filter: '=',
    title: '=',
    user: '='
  },
  controller: LoggerController,
  controllerAs: 'logger',
  templateUrl: 'components/logger/logger.tpl.html'
}).filter('logs', filterLogs).filter('logDate', logDateFilter);
});

;require.register("components/logs/logs.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/logs/logs.tpl');

var LogsController = function LogsController($injector) {
  _classCallCheck(this, LogsController);

  this.$injector = $injector;
};

_defineProperty(LogsController, "$inject", ['$injector']);

angular.module('manager').controller('LogsController', LogsController);
});

;require.register("components/newUser/newUser.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/newUser/newUser.tpl');

require('templates/userForm.tpl');

require('services/translate');

require('services/users');

var NewUserController = /*#__PURE__*/function () {
  function NewUserController($injector, translate, User) {
    _classCallCheck(this, NewUserController);

    this.$injector = $injector;
    this.user = new User({});
    this.i18n = {};
    translate('user.created', this.i18n);
    translate('user.error', this.i18n);
    this.users = User.query();
    this.required = $injector.get('UserRequired').get();
  }

  _createClass(NewUserController, [{
    key: "save",
    value: function save() {
      var _this = this;

      var flash = this.$injector.get('Flash');
      var $router = this.$injector.get('$router');
      this.user.$save(function () {
        flash.create('success', _this.i18n.created);
        $router.navigate($router.generate('user', {
          id: _this.user.uid,
          tab: 'infos'
        }));
      }, function () {
        flash.create('danger', _this.i18n.error);
      });
    }
  }]);

  return NewUserController;
}();

_defineProperty(NewUserController, "$inject", ['$injector', 'translate', 'User']);

angular.module('manager').controller('NewUserController', NewUserController);
});

;require.register("components/org/org.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/org/org.tpl');

require('templates/orgForm.tpl');

require('components/area/area');

require('services/orgs');

require('components/imageinput/imageinput');

var OrgController = /*#__PURE__*/function () {
  function OrgController($injector, $routeParams) {
    var _this = this;

    _classCallCheck(this, OrgController);

    this.$injector = $injector;
    this.q = '';
    $injector.get('PlatformInfos').get().$promise.then(function (platformInfos) {
      _this.tabs = platformInfos.competenceAreaEnabled ? ['infos', 'area', 'users', 'manage'] : ['infos', 'users', 'manage'];
    });
    this.tab = $routeParams.tab;
    this.itemsPerPage = 15;
    var translate = $injector.get('translate');
    this.i18n = {};
    translate('org.updated', this.i18n);
    translate('org.error', this.i18n);
    translate('org.deleted', this.i18n);
    translate('org.deleteError', this.i18n);
    translate('org.userremoved', this.i18n);
    translate('org.useradded', this.i18n);
    translate('org.delete', this.i18n);
    translate('user.remove', this.i18n);
    this.org = $injector.get('Orgs').get({
      id: $routeParams.org
    }, function () {
      return _this.loadUsers();
    });
    this.required = $injector.get('OrgsRequired').query();
    this.orgTypeValues = $injector.get('OrgsType').query(); // check if org is under delegation

    var Delegations = $injector.get('Delegations');
    Delegations.query(function (resp) {
      _this.delegations = resp.filter(function (d) {
        return d.orgs.indexOf($routeParams.org) !== -1;
      });
    });
  }

  _createClass(OrgController, [{
    key: "loadUsers",
    value: function loadUsers() {
      var _this2 = this;

      var User = this.$injector.get('User');
      User.query(function (users) {
        _this2.users = users.filter(function (u) {
          return u.org === _this2.org.name;
        });
        _this2.notUsers = users.filter(function (u) {
          return u.org !== _this2.org.name;
        });
      });
    }
  }, {
    key: "save",
    value: function save() {
      var _this3 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.org.$update(function () {
        $httpDefaultCache.removeAll();
        flash.create('success', _this3.i18n.updated);
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _this4 = this;

      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var flash = this.$injector.get('Flash');
      this.org.$delete(function () {
        $httpDefaultCache.removeAll();

        var $router = _this4.$injector.get('$router');

        $router.navigate($router.generate('orgs', {
          id: 'all'
        }));
        flash.create('success', _this4.i18n.deleted);
      }, flash.create.bind(flash, 'danger', this.i18n.deleteError));
    }
  }, {
    key: "confirm",
    value: function confirm() {
      var _this5 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.org.pending = false;
      this.org.$update(function () {
        $httpDefaultCache.removeAll();
        flash.create('success', _this5.i18n.updated);
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "associate",
    value: function associate(uid) {
      var _this6 = this;

      var unassociate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!uid) uid = this.user;
      if (!uid) return;
      var User = this.$injector.get('User');
      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      User.update({
        uid: uid,
        originalID: uid,
        org: unassociate ? '' : this.org.id
      }).$promise.then(function () {
        $httpDefaultCache.removeAll();

        _this6.loadUsers();

        flash.create('success', unassociate ? _this6.i18n.userremoved : _this6.i18n.useradded);
      });
    }
  }]);

  return OrgController;
}();

_defineProperty(OrgController, "$inject", ['$injector', '$routeParams']);

angular.module('manager').controller('OrgController', OrgController);
});

;require.register("components/orgs/orgs.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/orgs/orgs.tpl');

require('services/orgs');

var OrgsController = /*#__PURE__*/function () {
  function OrgsController($injector, $routeParams) {
    var _this = this;

    _classCallCheck(this, OrgsController);

    this.$injector = $injector;
    this.org = $routeParams.org;
    this.orgs = this.$injector.get('Orgs').query({
      logos: false
    }, function () {
      if (_this.org === 'pending') {
        _this.orgs = _this.orgs.filter(function (o) {
          return o.pending;
        });
      } else {
        // display no pendings orgs
        _this.orgs = _this.orgs.filter(function (o) {
          return !o.pending;
        });
      }

      _this.orgs.forEach(function (org) {
        org.membersCount = org.members.length;
        delete org.members;
      });

      _this.simplifiedOrgs = _this.orgs.map(function (org) {
        return {
          id: org.id,
          name: org.name,
          shortName: org.shortName,
          membersCount: org.membersCount,
          pending: org.pending,
          status: org.status,
          orgUniqueId: org.orgUniqueId
        };
      });
    });
    this.q = '';
    this.itemsPerPage = 15;
    this.newOrg = this.$injector.get('$location').$$search["new"] === 'org';

    if (this.newOrg) {
      var Org = this.$injector.get('Orgs');
      this.newInstance = new Org({});
    }

    this.required = $injector.get('OrgsRequired').query();
    this.orgTypeValues = $injector.get('OrgsType').query();
    var translate = this.$injector.get('translate');
    this.i18n = {};
    translate('org.created', this.i18n);
    translate('org.updated', this.i18n);
    translate('org.deleted', this.i18n);
    translate('org.error', this.i18n);
    translate('org.deleteError', this.i18n);
  }

  _createClass(OrgsController, [{
    key: "create",
    value: function create() {
      var Org = this.$injector.get('Orgs');
      this.newInstance = new Org({});
      var $location = this.$injector.get('$location');
      $location.search('new', 'org');
    }
  }, {
    key: "saveOrg",
    value: function saveOrg() {
      var _this2 = this;

      var flash = this.$injector.get('Flash');
      var $router = this.$injector.get('$router');
      var $location = this.$injector.get('$location');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.newInstance.$save(function () {
        flash.create('success', _this2.i18n.created);
        $httpDefaultCache.removeAll();
        $router.navigate($router.generate('org', {
          org: _this2.newInstance.id,
          tab: 'infos'
        }));
        $location.url($location.path());
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "close",
    value: function close() {
      this.newOrg = false;
      var $location = this.$injector.get('$location');
      $location.url($location.path());
    }
  }, {
    key: "activate",
    value: function activate($scope) {
      var _this3 = this;

      var $location = this.$injector.get('$location');
      $scope.$watch(function () {
        return $location.search()["new"];
      }, function (v) {
        _this3.newOrg = v === 'org';
      });
    }
  }]);

  return OrgsController;
}();

_defineProperty(OrgsController, "$inject", ['$injector', '$routeParams']);

OrgsController.prototype.activate.$inject = ['$scope'];
angular.module('manager').controller('OrgsController', OrgsController);
});

;require.register("components/role/role.es6", function(exports, require, module) {
"use strict";

require("components/role/role.tpl");

require("templates/roleForm.tpl");

require("services/roles");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RoleController = /*#__PURE__*/function () {
  function RoleController($injector, $routeParams) {
    _classCallCheck(this, RoleController);

    this.$injector = $injector;
    this.q = '';
    this.tabs = ['infos', 'users', 'manage'];
    this.tab = $routeParams.tab;
    this.itemsPerPage = 15;
    var translate = $injector.get('translate');
    this.i18n = {};
    translate('role.updated', this.i18n);
    translate('role.error', this.i18n);
    translate('role.deleted', this.i18n);
    translate('role.deleteError', this.i18n);
    translate('role.userremoved', this.i18n);
    translate('role.useradded', this.i18n);
    translate('user.remove', this.i18n);
    this.loadRoleAndUsers($routeParams.role);
  }

  _createClass(RoleController, [{
    key: "loadRoleAndUsers",
    value: function loadRoleAndUsers(id) {
      var _this = this;

      // Save original cn in case we change cn, because we need to
      // use original cn with PUT request
      this.role = this.$injector.get('Role').get({
        id: id
      }, function (role) {
        role.originalID = role.cn;
      });
      this.role.$promise.then(function () {
        var User = _this.$injector.get('User');

        User.query(function (users) {
          _this.users = users.filter(function (u) {
            return _this.role.users.indexOf(u.uid) >= 0;
          });
          _this.notUsers = users.filter(function (u) {
            return _this.role.users.indexOf(u.uid) === -1;
          });
        });
      });
    }
  }, {
    key: "save",
    value: function save() {
      var _this2 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var $router = this.$injector.get('$router');
      this.role.$update(function () {
        $httpDefaultCache.removeAll();
        _this2.role.originalID = _this2.role.cn;
        flash.create('success', _this2.i18n.updated);
        $router.navigate($router.generate('role', {
          role: _this2.role.cn,
          tab: 'infos'
        }));
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _this3 = this;

      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var flash = this.$injector.get('Flash');
      this.role.$delete(function () {
        $httpDefaultCache.removeAll();

        var $router = _this3.$injector.get('$router');

        $router.navigate($router.generate('roles', {
          id: 'all'
        }));
        flash.create('success', _this3.i18n.deleted);
      }, flash.create.bind(flash, 'danger', this.i18n.deleteError));
    }
  }, {
    key: "confirm",
    value: function confirm() {
      var _this4 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.role.status = 'REGISTERED';
      this.role.$update(function () {
        $httpDefaultCache.removeAll();
        flash.create('success', _this4.i18n.updated);
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "associate",
    value: function associate(uid) {
      var _this5 = this;

      var unassociate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (!uid) uid = this.user;
      if (!uid) return;
      var flash = this.$injector.get('Flash');
      var RolesUsers = this.$injector.get('RolesUsers');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      RolesUsers.save({
        users: [uid],
        PUT: unassociate ? [] : [this.role.cn],
        DELETE: unassociate ? [this.role.cn] : []
      }, function () {
        $httpDefaultCache.removeAll();

        _this5.loadRoleAndUsers(_this5.role.cn);

        flash.create('success', unassociate ? _this5.i18n.userremoved : _this5.i18n.useradded);
      }, function () {
        flash.create('danger', 'FAIL');
      });
    }
  }]);

  return RoleController;
}();

_defineProperty(RoleController, "$inject", ['$injector', '$routeParams']);

angular.module('manager').controller('RoleController', RoleController);
});

;require.register("components/roles/roles.es6", function(exports, require, module) {
"use strict";

require("components/roles/roles.tpl");

require("services/roles");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var RolesController = /*#__PURE__*/function () {
  function RolesController($injector, $routeParams) {
    var _this = this;

    _classCallCheck(this, RolesController);

    this.$injector = $injector;
    this.role = $routeParams.role;
    this.roles = this.$injector.get('Role').query(function () {
      _this.roles.forEach(function (r) {
        r.usersCount = r.users.length;
        delete r.users;
      });
    });
    this.q = '';
    this.itemsPerPage = 15;
    this.newRole = this.$injector.get('$location').$$search["new"] === 'role';

    if (this.newRole) {
      var Role = this.$injector.get('Role');
      this.newInstance = new Role({});
    }

    var translate = this.$injector.get('translate');
    this.i18n = {};
    translate('role.created', this.i18n);
    translate('role.updated', this.i18n);
    translate('role.deleted', this.i18n);
    translate('role.error', this.i18n);
    translate('role.deleteError', this.i18n);
  }

  _createClass(RolesController, [{
    key: "create",
    value: function create() {
      var Role = this.$injector.get('Role');
      this.newInstance = new Role({});
      var $location = this.$injector.get('$location');
      $location.search('new', 'role');
    }
  }, {
    key: "saveRole",
    value: function saveRole() {
      var _this2 = this;

      var flash = this.$injector.get('Flash');
      var $router = this.$injector.get('$router');
      var $location = this.$injector.get('$location');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.newInstance.$save(function () {
        flash.create('success', _this2.i18n.created);
        $httpDefaultCache.removeAll();
        $router.navigate($router.generate('role', {
          role: _this2.newInstance.cn,
          tab: 'infos'
        }));
        $location.url($location.path());
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "close",
    value: function close() {
      this.newRole = false;
      var $location = this.$injector.get('$location');
      $location.url($location.path());
    }
  }, {
    key: "activate",
    value: function activate($scope) {
      var _this3 = this;

      var $location = this.$injector.get('$location');
      $scope.$watch(function () {
        return $location.search()["new"];
      }, function (v) {
        _this3.newRole = v === 'role';
      });
    }
  }]);

  return RolesController;
}();

_defineProperty(RolesController, "$inject", ['$injector', '$routeParams']);

RolesController.prototype.activate.$inject = ['$scope'];
angular.module('manager').controller('RolesController', RolesController);
});

;require.register("components/stats/stats.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/stats/stats.tpl');

var StatsController = /*#__PURE__*/function () {
  function StatsController($element, $scope, $injector) {
    _classCallCheck(this, StatsController);

    this.$injector = $injector;
    this.$element = $element;
    this.$scope = $scope;
  }

  _createClass(StatsController, [{
    key: "$onInit",
    value: function $onInit() {
      var initialize = this.initialize.bind(this);

      if (this.data) {
        this.data.$promise.then(initialize);
      }

      this.$scope.$watch('stats.data', function (newVal, oldVal) {
        if (oldVal !== newVal) {
          newVal.$promise.then(initialize);
        }
      });
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this = this;

      var $element = this.$element;
      var options;
      this.parseData();
      this.granularity = this.data.granularity;

      if (this.type === 'bar') {
        options = {
          seriesBarDistance: 10,
          reverseData: true,
          horizontalBars: true,
          axisY: {
            offset: 200
          },
          axisX: {
            labelInterpolationFnc: function labelInterpolationFnc(value, index) {
              if (value > 1000000 && index % 2 === 0) {
                return null;
              }

              if (value >= 10000) {
                return Math.floor(value / 1000) + 'K';
              }

              return value;
            }
          }
        };
      } else {
        var formatDay = function formatDay(v) {
          var splits = v.split('-').reverse();
          splits.pop();
          return splits.join('/');
        };

        options = {
          fullWidth: true,
          axisY: {
            offset: 45,
            labelInterpolationFnc: function labelInterpolationFnc(value, index) {
              return value > 10000 ? Math.floor(value / 100) / 10 + 'K' : value;
            }
          },
          axisX: {
            labelInterpolationFnc: function labelInterpolationFnc(value, index) {
              if (_this.granularity === 'HOUR') {
                return value.split(' ')[1] + 'H';
              }

              if (_this.granularity === 'DAY' && _this.parsed.series[0].length > 8) {
                return parseInt(value.split('-')[2]) % 4 === 1 ? formatDay(value) : null;
              }

              if (_this.granularity === 'DAY') {
                return formatDay(value);
              }

              if (_this.granularity === 'WEEK') {
                return parseInt(value.split('-')[1]) % 2 === 0 ? value : null;
              }

              if (_this.granularity === 'MONTH') {
                return parseInt(value.split('-')[1]) % 3 === 1 ? value : null;
              }

              return value;
            }
          }
        };
      }

      var el = $element.find('.chartist');
      this.lines = new Chartist[this.type === 'bar' ? 'Bar' : 'Line'](el[0], this.parsed, options); // Replace foreign object with text tag to allow png export.
      // We then have to correctly place labels by ourselves.

      this.lines.on('draw', function (data) {
        if (data.type === 'label') {
          // Move x-axis label above bottom line
          var ydiff = 8;

          if (data.axis.units.dir === 'vertical') {
            // Align y-axis labels in front of lines
            var delta = el.height() / data.axis.ticks.length; // For bar graph, move it in front of bar

            ydiff = _this.type === 'bar' ? 18 : delta;
          }

          var text = Chartist.Svg('text', {
            x: data.x,
            y: data.y + ydiff
          }).text(data.text);
          data.element.replace(text);
        }
      });
      this.$injector.get('translate')(this.title).then(function (v) {
        return el.attr('title', v);
      });
      this.view = 'graph';

      this.exportPNG = function () {
        var el = $element.find('svg');
        el.append($('<style>' + Array.from(document.querySelector('.svg-styles').sheet.cssRules).map(function (x) {
          return x.cssText;
        }).join('') + '</style>'));
        saveSvgAsPng(el[0], 'image.png');
      };

      this.exportCSV = function () {
        _this.$injector.get('Analytics').download(_this.csvConfig).$promise.then(function (data) {
          window.saveAs(data.response.blob, 'document.csv');
        });
      };
    }
  }, {
    key: "switchView",
    value: function switchView() {
      this.view = this.view === 'graph' ? 'table' : 'graph';
    }
  }, {
    key: "parseData",
    value: function parseData() {
      var _this2 = this;

      var data = this.data.results;
      this.nodata = !data || data.length === 0;

      if (this.nodata) {
        return;
      }

      var serie = data.map(function (x) {
        return x[_this2.config[1]];
      });
      this.serie = this.type === 'line' ? [].concat(serie).reverse() : serie;
      this.parsed = {
        labels: data.map(function (x) {
          return x[_this2.config[0]];
        }),
        series: [[].concat(serie)]
      };
    }
  }]);

  return StatsController;
}();

_defineProperty(StatsController, "$inject", ['$element', '$scope', '$injector']);

angular.module('manager').component('stats', {
  bindings: {
    data: '=',
    type: '=',
    config: '=',
    title: '=',
    csvConfig: '='
  },
  controller: StatsController,
  controllerAs: 'stats',
  templateUrl: 'components/stats/stats.tpl.html'
});
});

;require.register("components/user/user.es6", function(exports, require, module) {
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/user/user.tpl');

require('services/util');

var UserController = /*#__PURE__*/function () {
  function UserController($routeParams, $injector, $location, User, Role, Orgs) {
    var _this = this;

    _classCallCheck(this, UserController);

    this.$injector = $injector;
    this.TMP_ROLE = this.$injector.get('temporaryRole');
    this.EXPIRED_ROLE = this.$injector.get('expiredRole');
    var translate = $injector.get('translate');
    this.i18n = {};
    var strings = ['user.updated', 'user.error', 'user.deleted', 'user.content', 'org.select', 'delegation.dupdated', 'delegation.ddeleted'];
    strings.map(function (str) {
      return translate(str, _this.i18n);
    });
    this.tabs = ['infos', 'roles', 'analytics', 'messages', 'logs', 'manage'];
    this.$injector.get('PlatformInfos').get().$promise.then(function (platformInfos) {
      if (!platformInfos.analyticsEnabled) {
        _this.tabs.splice(_this.tabs.indexOf('analytics'), 1);
      }
    });
    this.tab = $routeParams.tab;
    this.uid = $routeParams.id;
    this.user = User.get({
      id: this.uid
    }, function (user) {
      user.originalID = user.uid;

      if (user.org && user.org !== '') {
        user.orgObj = Orgs.get({
          id: user.org
        }, function (org) {
          user.validOrg = !org.pending;
        });
      } else {
        user.validOrg = true;
      }

      if (_this.tab === 'delegations') {
        var Delegations = $injector.get('Delegations');
        Delegations.query(function (resp) {
          var deleg = resp.find(function (x) {
            return x.uid === _this.user.uid;
          });
          var options = deleg || {
            orgs: [],
            roles: [],
            uid: _this.user.uid
          };
          _this.delegation = new Delegations(options);
          _this.activeDelegation = _this.hasDelegation();
          $injector.get('Orgs').query({
            logos: false
          }, function (orgs) {
            _this.orgs = orgs.filter(function (o) {
              return !o.pending;
            });
          });
        });
      }

      if (_this.tab === 'messages') {
        _this.messages = _this.$injector.get('Email').query({
          id: _this.user.uid
        }, function (r) {
          if ($location.$$path.indexOf('msgid') === -1) return;
          var msgid = new URLSearchParams($location.$$path.split('?').pop()).get('msgid');
          r.emails.forEach(function (m) {
            if (m.id.toString() === msgid) _this.openMessage(m);
          });
        });
      }
    });
    this.adminRoles = this.$injector.get('roleAdminList')();

    switch (this.tab) {
      case 'messages':
        this.templates = this.$injector.get('Templates').query();
        this.attachments = this.$injector.get('Attachments').query();
        break;

      default:
    }

    this.bindRoles();
    this.required = $injector.get('UserRequired').get();
  }

  _createClass(UserController, [{
    key: "hasDelegation",
    value: function hasDelegation() {
      if (!this.delegation) return false;
      return this.delegation.orgs.length !== 0 && this.delegation.roles.length !== 0;
    } // search each choosen span elements and set title manually
    // to display roles description on hover

  }, {
    key: "setTitles",
    value: function setTitles() {
      var _this2 = this;

      if (this.roleDescriptions) {
        [].forEach.call(document.querySelectorAll('li.search-choice span'), function (span) {
          return span.setAttribute('title', _this2.roleDescriptions[span.innerHTML]);
        });
      }
    }
  }, {
    key: "bindRoles",
    value: function bindRoles() {
      var _this3 = this;

      // Load role infos for every tab (for confirmation)
      var Role = this.$injector.get('Role');
      this.roles = Role.query(function (roles) {
        _this3.allroles = roles.map(function (r) {
          return r.cn;
        }); // get roles informations to get description from template

        _this3.roleDescriptions = {};
        roles.map(function (r) {
          _this3.roleDescriptions[r.cn] = r.description; // Check if user is expired

          if (r.cn === _this3.EXPIRED_ROLE) {
            _this3.user.$promise.then(function (user) {
              user.expired = r.users.indexOf(user.uid) >= 0;
            });
          }
        });
      });
      this.user.$promise.then(function () {
        var roleAdminFilter = _this3.$injector.get('roleAdminFilter');

        var notAdmin = [];

        _this3.$injector.get('$q').all([_this3.user.$promise, _this3.roles.$promise]).then(function () {
          _this3.user.roles = _this3.user.roles || [];
          _this3.user.adminRoles = _this3.user.adminRoles || {};

          _this3.roles.forEach(function (role) {
            if (role.users.indexOf(_this3.user.uid) >= 0) {
              if (roleAdminFilter(role)) {
                _this3.user.adminRoles[role.cn] = true;
              } else {
                _this3.user.roles.push(role.cn);
              }
            }

            if (!roleAdminFilter(role) && role.cn !== _this3.TMP_ROLE) {
              notAdmin.push(role.cn);
            }
          });

          _this3.roles = notAdmin;
        });
      });
    }
  }, {
    key: "loadAnalytics",
    value: function loadAnalytics($scope) {
      var date = this.$injector.get('date');
      this.date = {
        start: date.getFromDiff('year'),
        end: date.getEnd()
      };
      this.config = {
        layers: ['layer', 'count'],
        requests: ['date', 'count'],
        extractions: ['layer', 'count']
      };
      this.loadAnalyticsData();
    }
  }, {
    key: "loadAnalyticsData",
    value: function loadAnalyticsData() {
      var _this4 = this;

      var i18n = {};
      var i18nPromise = this.$injector.get('translate')('analytics.errorload', i18n);
      var flash = this.$injector.get('Flash');
      this.$injector.get('$q').all([this.user.$promise, i18nPromise]).then(function () {
        var error = flash.create.bind(flash, 'danger', i18n.errorload);

        var Analytics = _this4.$injector.get('Analytics');

        var options = {
          service: 'combinedRequests.json',
          user: _this4.user.uid,
          startDate: _this4.date.start,
          endDate: _this4.date.end
        };
        _this4.requests = Analytics.get(options, function () {}, error);

        var usageOptions = _objectSpread({}, options, {
          service: 'layersUsage.json',
          limit: 10
        });

        _this4.layers = Analytics.get(usageOptions, function () {}, error);
        _this4.usageOptions = _objectSpread({}, usageOptions);
        delete _this4.usageOptions.limit;
        _this4.usageOptions.service = 'layersUsage.csv';

        var extractionOptions = _objectSpread({}, options, {
          service: 'layersExtraction.json',
          limit: 10
        });

        _this4.extractions = Analytics.get(extractionOptions, function () {}, error);
        _this4.extractionOptions = _objectSpread({}, extractionOptions);
        delete _this4.extractionOptions.limit;
        _this4.extractionOptions.service = 'layersExtraction.csv';
      });
    }
  }, {
    key: "save",
    value: function save() {
      var _this5 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var $router = this.$injector.get('$router');
      this.user.$update(function () {
        $httpDefaultCache.removeAll();
        _this5.user.originalID = _this5.user.uid;
        flash.create('success', _this5.i18n.updated); // To update URI if uid has changed

        $router.navigate($router.generate('user', {
          id: _this5.user.uid,
          tab: 'infos'
        }));
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _this6 = this;

      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var flash = this.$injector.get('Flash');
      this.user.$delete(function () {
        $httpDefaultCache.removeAll();

        var $router = _this6.$injector.get('$router');

        $router.navigate($router.generate('users', {
          id: 'all'
        }));
        flash.create('success', _this6.i18n.deleted);
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "initCompose",
    value: function initCompose() {
      var _this7 = this;

      this.quill = new Quill(document.querySelector('#compose_content'), {
        modules: {
          toolbar: [[{
            header: [1, 2, false]
          }], ['bold', 'italic', 'underline', 'image', {
            color: []
          }, {
            align: []
          }]]
        },
        placeholder: this.i18n.content,
        theme: 'snow'
      });
      this.quill.on('text-change', function () {
        _this7.compose.content = _this7.quill.container.firstChild.innerHTML;
      });
    }
  }, {
    key: "openMessage",
    value: function openMessage(message) {
      var $router = this.$injector.get('$router');
      $router.navigate($router.generate('user', {
        id: this.user.uid,
        tab: 'messages',
        queryParams: {
          msgid: message.id
        }
      }));
      message.trusted = this.$injector.get('$sce').trustAsHtml(message.body);
      this.message = message;
    }
  }, {
    key: "closeMessage",
    value: function closeMessage(message) {
      var $router = this.$injector.get('$router');
      $router.navigate($router.generate('user', {
        id: this.user.uid,
        tab: 'messages'
      }));
      delete this.message;
      delete this.compose;
    }
  }, {
    key: "loadTemplate",
    value: function loadTemplate() {
      this.compose.subject = this.compose.template.name;
      this.quill.setText(this.compose.template.content);
    }
  }, {
    key: "sendMail",
    value: function sendMail() {
      var _this8 = this;

      var flash = this.$injector.get('Flash');
      var Mail = this.$injector.get('Mail');
      var i18n = {};
      this.$injector.get('translate')('msg.sent', i18n);
      this.$injector.get('translate')('msg.error', i18n);
      var attachments = [];

      for (var attachId in this.compose.attachments) {
        if (this.compose.attachments[attachId]) {
          attachments.push(attachId);
        }
      }

      new Mail({
        id: this.user.uid,
        subject: this.compose.subject,
        content: this.compose.content,
        attachments: attachments.join(',')
      }).$save(function (r) {
        delete _this8.compose;
        flash.create('success', i18n.sent);

        var $httpDefaultCache = _this8.$injector.get('$cacheFactory').get('$http');

        $httpDefaultCache.removeAll();
        _this8.messages = _this8.$injector.get('Email').query({
          id: _this8.user.uid
        });
      }, function () {
        flash.create('danger', i18n.error);
      });
    }
  }, {
    key: "confirm",
    value: function confirm() {
      this.user.pending = false;
      this.save();
    }
  }, {
    key: "deleteDelegation",
    value: function deleteDelegation() {
      var _this9 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.delegation.$delete(function () {
        $httpDefaultCache.removeAll();
        flash.create('success', _this9.i18n.ddeleted);
        _this9.delegation = new (_this9.$injector.get('Delegations'))({
          uid: _this9.user.uid,
          roles: [],
          orgs: []
        });
        _this9.activeDelegation = false;
      }, flash.create.bind(flash, 'danger', this.i18n.derror));
    }
  }, {
    key: "saveDelegation",
    value: function saveDelegation() {
      var _this10 = this;

      var flash = this.$injector.get('Flash');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      this.delegation.$update(function () {
        $httpDefaultCache.removeAll();
        flash.create('success', _this10.i18n.dupdated);
        _this10.activeDelegation = _this10.hasDelegation();
      }, flash.create.bind(flash, 'danger', this.i18n.derror));
    }
  }, {
    key: "activate",
    value: function activate($scope) {
      var _this11 = this;

      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var flash = this.$injector.get('Flash');
      $scope.$watch(function () {
        return $scope.profile;
      }, function (p) {
        if (p !== 'SUPERUSER' || _this11.tabs.indexOf('delegations') !== -1) return;

        _this11.tabs.splice(3, 0, 'delegations');
      });

      var saveRoles = function saveRoles(newVal, oldVal) {
        var _this12 = this;

        if (!newVal || !oldVal) {
          return;
        }

        var removeTmp = function removeTmp(g) {
          return g !== _this12.TMP_ROLE;
        };

        newVal = newVal.filter(removeTmp);
        oldVal = oldVal.filter(removeTmp);
        var toPut = newVal.filter(function (a) {
          return oldVal.indexOf(a) === -1;
        });
        var toDel = oldVal.filter(function (a) {
          return newVal.indexOf(a) === -1;
        });

        if (toPut.length === 0 && toDel.length === 0) {
          return;
        }

        if (toPut.length > 1 && toDel.length === 0) {
          return;
        } // Wrong artifacts


        var i18n = {};
        this.$injector.get('translate')('users.roleUpdated', i18n);
        this.$injector.get('translate')('users.roleUpdateError', i18n);
        this.rolePromise = this.$injector.get('RolesUsers').save({
          users: [this.user.uid],
          PUT: toPut,
          DELETE: toDel
        }, function () {
          flash.create('success', i18n.roleUpdated);
          $httpDefaultCache.removeAll();
        }, function () {
          flash.create('danger', i18n.roleUpdateError);
        });
      };

      this.$injector.get('$q').all([this.user.$promise, this.roles.$promise]).then(function () {
        $scope.$watch(function () {
          return _this11.user.roles;
        }, saveRoles.bind(_this11));
        var previousRoles;
        $scope.$watchCollection(function () {
          var roles = [];

          for (var g in _this11.user.adminRoles) {
            if (_this11.user.adminRoles[g]) {
              roles.push(g);
            }
          }

          if (_this11.user.adminRoles) {
            previousRoles = roles; // to manually display roles description on roles multi select elements

            _this11.setTitles();

            return roles;
          } else {
            return previousRoles;
          }
        }, saveRoles.bind(_this11));
      });
      var platformInfos = this.$injector.get('PlatformInfos').get();

      if (this.tab === 'analytics' && platformInfos.analyticsEnabled) {
        this.loadAnalytics($scope);
      }
    }
  }, {
    key: "isUnassignableRole",
    value: function isUnassignableRole(role) {
      return this.$injector.get('readonlyRoleList').includes(role);
    }
  }]);

  return UserController;
}();

_defineProperty(UserController, "$inject", ['$routeParams', '$injector', '$location', 'User', 'Role', 'Orgs']);

UserController.prototype.activate.$inject = ['$scope'];
angular.module('manager').controller('UserController', UserController).filter('encodeURIComponent', function () {
  return window.encodeURIComponent;
}).directive('managers', ['$timeout', 'User', function ($timeout, User) {
  return {
    link: function link(scope, elm, attrs, ctrl) {
      var promise = scope.$eval(attrs.promise);
      var selUsers = [];
      User.query(function (users) {
        users.map(function (u) {
          var id = u.uid;
          selUsers.push({
            id: id,
            text: (u.sn || '') + ' ' + (u.givenName || '')
          });
        });
        elm.select2({
          placeholder: '',
          allowClear: true,
          data: selUsers
        });

        var cb = function cb() {
          $timeout(function () {
            elm.trigger('change');
          });
        };

        if (promise) {
          promise.then(cb);
        } else {
          cb();
        }
      });
    }
  };
}]).directive('organizations', ['$timeout', '$router', 'Orgs', function ($timeout, $router, Orgs) {
  return {
    link: function link(scope, elm, attrs, ctrl) {
      var promise = scope.$eval(attrs.promise);
      var user = scope.$eval(attrs.model); // Initialize pending value for new user

      if (user.pending === undefined) {
        user.pending = false;
      }

      var selOrgs = [];
      Orgs.query({
        logos: false
      }, function (orgs) {
        orgs.forEach(function (o) {
          if (user.pending || !o.pending) {
            selOrgs.push({
              id: o.id,
              text: o.name
            });
          }
        }); // create template to format selected element

        var formatSelected = function formatSelected(state) {
          if (!state.id) return state.text;
          var route = $router.generate('org', {
            org: state.id,
            tab: 'infos'
          });
          return $("<a href=\"#!".concat(route, "\">").concat(state.text, "</a>"));
        };

        elm.select2({
          templateSelection: formatSelected,
          placeholder: '',
          allowClear: true,
          data: selOrgs
        });

        var cb = function cb() {
          $timeout(function () {
            elm.trigger('change');
          });
        };

        if (promise) {
          promise.then(cb);
        } else {
          cb();
        }
      });
    }
  };
}]);
});

;require.register("components/users/users.es6", function(exports, require, module) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require('components/users/users.tpl');

require('services/users');

require('services/roles_users');

require('services/logs');

require('services/messages');

var UsersController = /*#__PURE__*/function () {
  function UsersController($routeParams, $injector, User, Role) {
    var _this = this;

    _classCallCheck(this, UsersController);

    this.$injector = $injector;
    this.q = '';
    this.itemsPerPage = 25;
    this.selection = [];
    this.filterSelected = false;
    this.newRole = this.$injector.get('$location').$$search["new"] === 'role';
    this.newRoleName = '';
    this.users = User.query(function () {
      _this.allUsers = _this.users.slice();
    });
    var active = $routeParams.id;
    this.roles = Role.query();
    this.activePromise = this.roles.$promise.then(function () {
      _this.activeRole = _this.roles.filter(function (g) {
        return g.cn === active;
      })[0];

      if (active === 'pending') {
        _this.activeRole = {
          cn: 'PENDING',
          description: 'users.pending_desc'
        };
      } // filter users


      _this.filter(_this.activeRole);

      return _this.activeRole;
    });
    this.selectionFilter = this.selectionFilter.bind(this);
  }

  _createClass(UsersController, [{
    key: "filter",
    value: function filter(role) {
      var _this2 = this;

      this.users.$promise.then(function () {
        // Display no pending users by default
        _this2.users = _this2.allUsers.filter(function (user) {
          return !user.pending;
        }); // Special case for pending

        if (role && role.cn === 'PENDING') {
          _this2.users = _this2.allUsers.filter(function (user) {
            return user.pending;
          });
          return;
        }

        _this2.users = _this2.allUsers.filter(function (user) {
          return role.users.indexOf(user.uid) >= 0;
        });
      });
    }
  }, {
    key: "toggleSelected",
    value: function toggleSelected(uid) {
      if (this.selection.indexOf(uid) >= 0) {
        this.selection = this.selection.filter(function (id) {
          return id !== uid;
        });
      } else {
        this.selection.push(uid);
      }
    }
  }, {
    key: "select",
    value: function select(sel) {
      var filter = this.$injector.get('$filter')('filter');

      switch (sel) {
        case 'all':
          this.selection = filter(this.users, this.q).map(function (u) {
            return u.uid;
          });
          break;

        case 'none':
          this.selection = [];
          break;
      }
    }
  }, {
    key: "selectionFilter",
    value: function selectionFilter(u) {
      return this.filterSelected ? this.selection.indexOf(u.uid) >= 0 : true;
    }
  }, {
    key: "export_",
    value: function export_(fileType) {
      var _this3 = this;

      var download = this.$injector.get("Export".concat(fileType.toUpperCase()));
      download(this.selection).then(function (result) {
        if (result.status !== 200) {
          throw new Error("Cannot fetch users list. error ".concat(result.status));
        }

        var mimetype = '';

        switch (fileType) {
          case 'vcf':
            mimetype = 'text/x-vcard';
            break;

          default:
            mimetype = "text/".concat(fileType);
        }

        var blob = new Blob(["\uFEFF", result.data], {
          type: mimetype
        });
        var a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.target = '_blank';

        var filter = _this3.$injector.get('$filter');

        var date = filter('date')(new Date(), 'yyyyMMdd-HHmmss');
        a.download = "".concat(date, "_users_export.").concat(fileType);
        document.body.appendChild(a); // create the link "a"

        a.click(); // click the link "a"

        document.body.removeChild(a);
      })["catch"](function (err) {
        var flash = _this3.$injector.get('Flash');

        flash.create('danger', err);
      });
    }
  }, {
    key: "exportCSV",
    value: function exportCSV() {
      this.export_('csv');
    }
  }, {
    key: "exportVCF",
    value: function exportVCF() {
      this.export_('vcf');
    }
  }, {
    key: "close",
    value: function close() {
      this.newRole = false;
      this.newRoleName = '';
      var $location = this.$injector.get('$location');
      $location.url($location.path());
    }
  }, {
    key: "saveRole",
    value: function saveRole() {
      var _this4 = this;

      var flash = this.$injector.get('Flash');
      var $router = this.$injector.get('$router');
      var $location = this.$injector.get('$location');
      var $httpDefaultCache = this.$injector.get('$cacheFactory').get('$http');
      var role = new (this.$injector.get('Role'))();
      role.cn = this.newRoleName;
      role.description = this.newRoleDesc;
      role.$save(function () {
        flash.create('success', _this4.i18n.created);
        $httpDefaultCache.removeAll();
        $router.navigate($router.generate('users', {
          id: role.cn
        }));
        $location.url($location.path());
      }, flash.create.bind(flash, 'danger', this.i18n.error));
    }
  }, {
    key: "activate",
    value: function activate($scope) {
      var _this5 = this;

      var $location = this.$injector.get('$location');
      $scope.$watch(function () {
        return $location.search()["new"];
      }, function (v) {
        _this5.newRole = v === 'role';
      });
    }
  }]);

  return UsersController;
}();

_defineProperty(UsersController, "$inject", ['$routeParams', '$injector', 'User', 'Role']);

UsersController.prototype.activate.$inject = ['$scope'];
angular.module('manager').controller('UsersController', UsersController).directive('validateRole', function () {
  return {
    require: 'ngModel',
    link: function link(scope, elm, attrs, ctrl) {
      ctrl.$validators.validateRole = function (modelValue, viewValue) {
        var roles = scope.$eval(attrs.validateRole);
        var prefix = viewValue.substr(0, viewValue.lastIndexOf('_'));
        return prefix === '' || roles.some(function (g) {
          return g.cn === prefix;
        });
      };
    }
  };
});
});

;require.register("services/analytics.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('Analytics', ['$resource', 'ANALYTICS_SERVICES_PATH', function ($resource, baseUri) {
  return $resource(baseUri + ':service', {
    service: '@service'
  }, {
    get: {
      method: 'POST',
      cache: true,
      isArray: false
    },
    download: {
      method: 'POST',
      headers: {
        accept: 'application/csv'
      },
      responseType: 'arraybuffer',
      cache: false,
      transformResponse: function transformResponse(data, headers) {
        var csv = null;

        if (data) {
          csv = new Blob([data], {
            type: 'application/csv'
          });
        }

        return {
          response: {
            blob: csv,
            fileName: 'export.csv'
          }
        };
      }
    }
  });
}]);
});

;require.register("services/delegations.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('Delegations', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'delegation/delegations', {}, {
    query: {
      cache: true,
      method: 'GET',
      isArray: true
    },
    get: {
      isArray: false
    },
    update: {
      url: baseUri + 'delegation/:uid',
      params: {
        uid: '@uid'
      },
      method: 'POST'
    },
    "delete": {
      url: baseUri + 'delegation/:uid',
      params: {
        uid: '@uid'
      },
      method: 'DELETE'
    }
  });
}]);
});

;require.register("services/logs.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('Logs', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'admin_logs/:limit/:page', {}, {
    query: {
      method: 'GET',
      cache: true,
      isArray: true
    }
  });
}]).factory('UserLogs', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'admin_logs/:id/:limit/:page', {}, {
    query: {
      method: 'GET',
      cache: true,
      isArray: true
    }
  });
}]);
});

;require.register("services/messages.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('Templates', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + '../emailTemplates', {}, {
    query: {
      cache: true,
      isArray: false
    }
  });
}]).factory('Mail', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + '../:id/sendEmail', {
    id: '@id'
  }, {
    save: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      transformRequest: function transformRequest(data) {
        return $.param({
          subject: data.subject,
          content: data.content,
          attachments: data.attachments
        });
      }
    }
  });
}]).factory('Attachments', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + '../attachments', {}, {
    query: {
      cache: true,
      isArray: false
    }
  });
}]);
});

;require.register("services/orgs.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('Orgs', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'orgs/:id', {}, {
    query: {
      cache: true,
      method: 'GET',
      isArray: true,
      params: {
        logos: '@logos'
      }
    },
    get: {
      params: {
        id: '@id'
      },
      method: 'GET',
      cache: true,
      isArray: false
    },
    update: {
      params: {
        id: '@id'
      },
      method: 'PUT'
    },
    "delete": {
      params: {
        id: '@id'
      },
      method: 'DELETE'
    }
  });
}]).factory('OrgsRequired', ['$resource', 'CONSOLE_PUBLIC_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'orgs/requiredFields', {}, {
    query: {
      method: 'GET',
      cache: true,
      transformResponse: function transformResponse(data) {
        var response = {};
        JSON.parse(data).forEach(function (key) {
          response[key] = true;
        });
        return response;
      }
    }
  });
}]).factory('OrgsType', ['$resource', 'CONSOLE_PUBLIC_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'orgs/orgTypeValues', {}, {
    query: {
      method: 'GET',
      cache: true,
      isArray: true
    }
  });
}]);
});

;require.register("services/roles.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('Role', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'roles/:id', {}, {
    query: {
      cache: true,
      method: 'GET',
      isArray: true
    },
    get: {
      isArray: false
    },
    update: {
      params: {
        id: '@originalID'
      },
      method: 'PUT'
    },
    "delete": {
      params: {
        id: '@cn'
      },
      method: 'DELETE'
    }
  });
}]).factory('roleAdminList', [function () {
  var adminRoles = ['SUPERUSER', 'ADMINISTRATOR', 'GN_ADMIN', 'GN_EDITOR', 'GN_REVIEWER', 'ORGADMIN', 'MAPSTORE_ADMIN', 'USER', 'PENDING', 'EXPIRED', 'REFERENT', 'TEMPORARY', 'IMPORT'];
  return function () {
    return adminRoles;
  };
}]).factory('readonlyRoleList', [function () {
  var readonlyRoles = ['PENDING', 'EXPIRED', 'TEMPORARY', 'ORGADMIN'];
  return readonlyRoles;
}]).factory('expiredRole', function () {
  return 'EXPIRED';
}).factory('temporaryRole', function () {
  return 'TEMPORARY';
}).factory('roleAdminFilter', ['roleAdminList', function (roleAdminList) {
  return function (role) {
    return roleAdminList().indexOf(role.cn) >= 0;
  };
}]);
});

;require.register("services/roles_users.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('RolesUsers', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'roles_users', {}, {});
}]);
});

;require.register("services/translate.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('translate', ['$translate', function ($translate) {
  return function (str, dict) {
    var promise = $translate(str);

    if (dict) {
      promise.then(function (v) {
        dict[str.split('.')[1]] = v;
        return v;
      });
    }

    return promise;
  };
}]);
});

;require.register("services/users.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('User', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'users/:id', {
    id: '@uid'
  }, {
    query: {
      cache: true,
      method: 'GET',
      isArray: true
    },
    get: {
      cache: true
    },
    update: {
      params: {
        id: '@originalID'
      },
      method: 'PUT'
    }
  });
}]).factory('Email', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + '../:id/emails', {
    id: '@id'
  }, {
    query: {
      method: 'GET',
      isArray: false
    }
  });
}]).factory('Profile', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'users/profile', {}, {
    query: {
      method: 'GET',
      isArray: false
    }
  });
}]).factory('UserRequired', ['$resource', 'CONSOLE_PUBLIC_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'users/requiredFields', {}, {
    get: {
      method: 'GET',
      cache: true,
      transformResponse: function transformResponse(data) {
        var response = {};
        JSON.parse(data).forEach(function (key) {
          response[key] = true;
        });
        return response;
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }
  });
}]).factory('ExportCSV', ['$http', 'CONSOLE_PRIVATE_PATH', function ($http, baseUri) {
  return function (users) {
    return $http.post(baseUri + 'export/users.csv', users, {
      cache: false,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/csv'
      }
    });
  };
}]).factory('ExportVCF', ['$http', 'CONSOLE_PRIVATE_PATH', function ($http, baseUri) {
  return function (users) {
    return $http.post(baseUri + 'export/users.vcf', users, {
      cache: false,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/x-vcard'
      }
    });
  };
}]);
});

;require.register("services/util.es6", function(exports, require, module) {
"use strict";

angular.module('manager').factory('date', function () {
  var format = 'YYYY-MM-DD';
  return {
    getFromDiff: function getFromDiff(interval) {
      var m = moment().add(1, 'day');

      if (interval === 'day') {
        m = m.subtract(1, 'day');
      }

      if (interval === 'week') {
        m = m.subtract(1, 'weeks');
      }

      if (interval === 'month') {
        m = m.subtract(1, 'months');
      }

      if (interval === '3month') {
        m = m.subtract(3, 'months');
      }

      if (interval === 'year') {
        m = m.subtract(1, 'year');
      }

      return m.format(format);
    },
    getDefault: function getDefault() {
      return moment().add(1, 'day').subtract(1, 'month').format(format);
    },
    getEnd: function getEnd() {
      return moment().add(1, 'day').format(format);
    }
  };
}).factory('PlatformInfos', ['$resource', 'CONSOLE_PRIVATE_PATH', function ($resource, baseUri) {
  return $resource(baseUri + 'platform/infos', {}, {
    query: {
      method: 'GET',
      isArray: false
    }
  });
}]);
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map