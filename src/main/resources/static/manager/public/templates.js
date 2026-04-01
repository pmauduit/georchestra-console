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
require.register("components/analytics/analytics.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/analytics/analytics.tpl.html', [
'<section class="analytics">',
'',
'  <date class="stats-conf" model="analytics.date" callback="analytics.load(analytics.role)"></date>',
'',
'  <select class="form-control stats-conf" ng-model="analytics.role" ng-change="analytics.setRole()"',
'    ng-options="role.cn as role.label for role in analytics.roles" chosen>',
'  </select>',
'',
'  <h3>',
'    <span translate>analytics.title</span>',
'    <span ng-if="analytics.role != \'all\'">',
'      <span translate>for</span>',
'      {{analytics.role}}',
'    </span>',
'  </h3>',
'',
'  <hr>',
'',
'  <div class="row">',
'    <stats',
'        data="analytics.requests"',
'        type="\'line\'"',
'        config="analytics.config.requests"',
'        title="\'analytics.requests\'"',
'        class="col-md-6"',
'        csv-config="analytics.requestsOptions"',
'    ></stats>',
'    <stats',
'        data="analytics.layers"',
'        type="\'bar\'"',
'        config="analytics.config.layers"',
'        title="\'analytics.layers\'"',
'        class="col-md-6"',
'        csv-config="analytics.usageOptions"',
'    ></stats>',
'  </div>',
'  <hr>',
'  <div class="row" ng-if="platformInfos.extractorappEnabled">',
'    <stats data="analytics.extractions" type="\'bar\'" config="analytics.config.extractions"',
'           title="\'analytics.extractions\'" class="col-md-4" csv-config="analytics.extractionOptions"/>',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/area/area.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/area/area.tpl.html', [
'<div class="area clearfix">',
'',
'  <div class="col-md-{{ area.maponly ? \'12\' : \'8\' }}">',
'    <div class="map">',
'      <div class="attributions">',
'        © <a href="http://openstreetmap.org" rel="noopener noreferrer" target="blank_">OpenStreetMap</a>',
'        contributors.',
'      </div>',
'      <div class="btn-group selection" ng-if="!area.maponly">',
'        <select ng-change="area.selectBy()" ng-model="area.group" class="btn btn-default btn-sm">',
'          <option value="" selected disabled class="glyphicon glyphicon-ok-circle" translate>',
'            area.selection',
'          </option>',
'          <option value="all" class="alternate">— {{ \'area.all\' | translate }} —</option>',
'          <option value="{{group}}" ng-repeat="group in area.groups">{{group}}</option>',
'          <option value="none" class="alternate">— {{ \'area.none\' | translate }} —</option>',
'        </select>',
'        <button class="btn btn-default btn-sm ol-bbox" title="{{ \'area.selectByBBOX\' | translate }}"',
'          ng-click="area.selectBBOX()" ng-class="{active: area.draw}" type="button" translate>',
'          area.selectByBBOX',
'        </button>',
'      </div>',
'',
'      <div class="search-container" ng-init="search=\'\'" ng-if="!area.maponly">',
'        <button class="btn btn-link btn-sm search-clear" ng-click="search = \'\'" ng-show="search != \'\'">',
'          <i class="glyphicon glyphicon-remove-sign"></i>',
'        </button>',
'        <input class="search form-control input-sm" placeholder="{{ \'area.search\' | translate }}" ng-model="search">',
'      </div>',
'    </div>',
'  </div>',
'',
'  <div class="col-md-4" ng-if="!area.maponly">',
'',
'    <p class="alert alert-info">',
'      {{area.collection.getArray().length}} {{ \'area.area\' | translate }}',
'      <button ng-if="area.item.$resolved" class="btn btn-default btn-sm" ng-click="area.save()" translate>area.save</button>',
'      <input type="hidden" ng-if="!area.item.$resolved" ng-value="area.ids" name="orgCities">',
'    </p>',
'    ',
'    <ul class="list">',
'      <li dir-paginate="f in area.collection.getArray() | itemsPerPage: 20">',
'        <a class="text-danger pull-right" href="javascript:void(0)" ng-click="area.removeFromSelection(f)">',
'          <i class="glyphicon glyphicon-remove"></i>',
'        </a>',
'        {{f.get(\'_label\')}}',
'      </li>',
'    </ul>',
'    <dir-pagination-controls max-size="7"></dir-pagination-controls>',
'',
'    <div class="btn-group importexport" ng-if="area.canExport">',
'      <button class="btn btn-default btn-sm" ng-click="area.import()" translate>area.import</button>',
'      <button class="btn btn-default btn-sm" ng-click="area.export()" translate>area.export</button>',
'    </div>',
'',
'  </div>',
'',
'  <div class="loading" ng-show="area.loading">',
'    <i class="glyphicon glyphicon-map-marker glyphicon-spin"></i>',
'  </div>',
'',
'</div>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/browse/browse.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/browse/browse.tpl.html', [
'<div class="alert alert-info">',
'  <a ng-link="users({id: \'all\'})" class="category" ng-class="{active: !roles.activeRole}" translate>role.allusers</a>',
'  <div ng-repeat="role in roles.adminList | filter: roles.protected">',
'    <a ng-link="users({id: role.cn})" class="category" ng-class="{active: roles.activeRole.cn === role.cn}">',
'      <span>{{\'users.\'+role.cn | translate}}</span>',
'      ({{::role.users.length}})',
'    </a>',
'  </div>',
'  <a ng-link="users({id: \'pending\'})" class="category" ng-class="{active: roles.activeRole.cn === \'PENDING\'}">',
'    <span translate>users.PENDING</span>',
'    ({{roles.pendingCount}})',
'  </a>',
'  <hr>',
'  <div class="create-btn">',
'    <a ng-link="newUser" class="btn btn-default" translate>role.newuser</a>',
'  </div>',
'</div>',
'',
'<input ng-model="roles.q" class="form-control input-sm" placeholder="{{\'role.search\' | translate}}">',
'',
'<h5 ng-if="roles.q == \'\'" translate>role.system</h5>',
'<div ng-repeat="role in roles.adminList | filter: roles.unprotected" ng-if="roles.q == \'\'">',
'  <strong ng-if="(roles.activeRole.cn == role.cn)">',
'    {{::role.cn}} ({{::role.users.length}})',
'  </strong>',
'  <a ng-link="users({id: role.cn})" ng-if="(roles.activeRole.cn != role.cn)" title={{::role.description}}>',
'    {{::role.cn}}',
'   ({{::role.users.length}})',
' </a>',
'</div>',
'',
'<h5 ng-if="roles.q == \'\'" translate>role.favorites</h5>',
'<div ng-repeat="role in roles.roles.filter(roles.favoriteRole)" ng-if="roles.q == \'\'" title={{::role.description}}>',
'  <strong ng-if="(roles.activeRole.cn == role.cn)">',
'    {{::role.cn}} ({{::role.users.length}})',
'  </strong>',
'  <a ng-link="users({id: role.cn})" ng-if="(roles.activeRole.cn != role.cn)">',
'    {{::role.cn}}',
'   ({{::role.users.length}})',
' </a>',
'</div>',
'',
'<div ng-repeat="(key, role) in roles.index" ng-if="roles.q != \'\'">',
'  <a ng-link="users({id: role.cn})" title={{::role.description}}',
'      ng-if="role.cn.toLowerCase().indexOf(roles.q.toLowerCase()) >= 0">',
'    {{::role.cn}} ({{::role.users.length}})',
'  </a>',
'</div>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/date/date.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/date/date.tpl.html', [
'<div class="input-daterange input-group" ng-show="date.option.value==\'custom\'">',
'  <input type="text" class="form-control" name="start" ng-model="date.model.start" />',
'  <span class="input-group-addon">{{ \'date.to\' | translate }}</span>',
'  <input type="text" class="form-control" name="end"  ng-model="date.model.end"/>',
'</div>',
'<select class="form-control" ng-class="{ \'custom\' : date.option.value==\'custom\'}"',
'  ng-model="date.option" ng-change="date.change()"',
'  ng-options="option as option.label | translate for option in date.options track by option.value">',
'</select>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/delegations/delegations.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/delegations/delegations.tpl.html', [
'<section class="delegations" ng-if="profile === \'SUPERUSER\'">',
'',
'  <div class="col-md-12">',
'',
'    <input type="text" class="filter-table form-control pull-right" ng-model="delegations.q" placeholder="{{\'delegations.filter\' | translate}}"></input>',
'    <i class="glyphicon glyphicon-remove-sign filter-table-reset" ng-show="delegations.q != \'\'" ng-click="delegations.q = \'\'"></i>',
'    <h3 class="delegations-title">',
'      <ng-pluralize count="delegations.delegations.length"',
'                    when="{\'0\': \'{{ &quot;delegations.title_no_delegations&quot; | translate }}\',',
'                           \'1\': \'{} {{ &quot;delegations.title&quot; | translate }}\',',
'                           \'other\': \'{} {{ &quot;delegations.title_plural&quot; | translate }}\'}">',
'      </ng-pluralize>',
'    </h3>',
'',
'    <table class="table table-striped table-condensed">',
'',
'      <thead>',
'        <tr>',
'          <th translate>home.user</th>',
'          <th translate>nav.orgs</th>',
'          <th translate>nav.roles</th>',
'        </tr>',
'      </thead>',
'',
'      <tbody>',
'        <tr dir-paginate="delegation in delegations.delegations | filter:delegations.q | itemsPerPage: delegations.itemsPerPage">',
'          <td style="max-width: 15vw">',
'            <a ng-link="user({id: delegation.uid, tab: \'delegations\'})" class="break-word">{{::delegation.uid}}</a>',
'          </td>',
'          <td>',
'            <span ng-repeat="org in delegation.orgs">',
'            <a ng-link="org({org: org, tab: \'infos\'})">{{ delegations.orgs[org].name }}</a>{{$last ? \'\' : \', \'}}',
'            </span>',
'          </td>',
'          <td>',
'            <span ng-repeat="role in delegation.roles">',
'              <a ng-link="role({role: role, tab: \'infos\'})">{{ role }}</a>{{$last ? \'\' : \', \'}}',
'            </span>',
'          </td>',
'        </tr>',
'      </tbody>',
'',
'    </table>',
'',
'    <dir-pagination-controls></dir-pagination-controls>',
'',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/home/home.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/home/home.tpl.html', [
'<section class="home row">',
'',
'  <div class="col-md-4">',
'    <div class="alerts">',
'      <div class="alert alert-info">',
'        <i class="glyphicon glyphicon-user pull-right"></i>',
'        <i class="glyphicon glyphicon-user pull-right"></i>',
'        <a ng-link="users({id: \'all\'})" translate>home.users</a>',
'      </div>',
'      <div class="alert alert-danger" ng-if="home.pendingCount > 0">',
'        <a ng-link="users({id: \'pending\'})">',
'          <span><ng-pluralize count="home.pendingCount"',
'                        when="{\'1\': \'{} {{ &quot;home.waiting_user&quot; | translate }}\',',
'                               \'other\': \'{} {{ &quot;home.waiting_users&quot; | translate }}\'}">',
'          </span><br>',
'          <span class="manage" translate>home.view_manage</span>',
'        </a>',
'      </div>',
'      <div class="alert alert-warning" ng-if="home.expired && home.expired.users.length > 0">',
'        <a ng-link="users({id: home.expired.cn})">',
'          <span><ng-pluralize count="home.expired.users.length"',
'                        when="{\'1\': \'{} {{ &quot;home.expired_user&quot; | translate }}\',',
'                               \'other\': \'{} {{ &quot;home.expired_users&quot; | translate }}\'}">',
'          </span><br>',
'          <span class="manage" translate>home.view_manage</span>',
'        </a>',
'      </div>',
'    </div>',
'',
'    <div class="jumbotron" ng-if="platformInfos.analyticsEnabled">',
'      <h1 ng-if="home.connected && home.connected.results.length > 0" ng-cloack>{{::home.connected.results.length}}</h1>',
'      <p><ng-pluralize count="home.connected.results.length"',
'                       when="{\'0\': \'{{ &quot;home.connected_users_none&quot; | translate }}\',',
'                              \'1\': \'{{ &quot;home.connected_user&quot; | translate }}\',',
'                              \'other\': \'{{ &quot;home.connected_users&quot; | translate }}\'}">',
'      </p>',
'      <div ng-if="home.connected.results && home.connected.results.length > 0">      ',
'        <table class="table table-condensed">',
'          <thead>',
'            <tr>',
'              <th translate>home.nb_requests</th>',
'              <th translate>home.user</th>',
'              <th translate>home.org</th>',
'            </tr>',
'          </thead>',
'          <tbody>',
'            <tr dir-paginate="user in home.connected.results | itemsPerPage: 10">',
'              <td title="{{::user.nb_requests}}">{{::user.nb_requests}}</td>',
'              <td title="{{::user.user}}"><a ng-link="user({id: user.user, tab: \'infos\'})">{{::user.user}}</a></td>',
'              <td title="{{::user.organization}}">{{::user.organization}}</td>',
'            </tr>',
'          </tbody>',
'        </table>',
'        <dir-pagination-controls></dir-pagination-controls>',
'      </div>',
'    </div>',
'',
'  </div>',
'',
'  <div class="col-md-8">',
'    <stats data="home.requests" type="\'line\'" config="[\'date\', \'count\']" title="\'analytics.requests\'" ng-if="platformInfos.analyticsEnabled"></stats>',
'    <logger filter="false" title="true"></logger>',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/imageinput/imageinput.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/imageinput/imageinput.tpl.html', [
'<div class="row">',
'  <div class="col-md-4">',
'    <label class="btn btn-primary">',
'      <span translate>imageinput.label</span>',
'      <input',
'        type="file"',
'        accept="image/*"',
'        class="image-input"',
'        style="display:none;"',
'      />',
'    </label>',
'  </div>',
'  <div class="col-md-8" ng-show="imageinput.value">',
'    <button ng-click="imageinput.delete()" class="close delete-logo">',
'      &times;',
'    </button>',
'    <img',
'      class="preview img-responsive"',
'      ng-src="data:image/jpeg;base64,{{imageinput.value}}"',
'    />',
'  </div>',
'</div>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/logger/logger.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/logger/logger.tpl.html', [
'<section class="logger">',
'    <button ng-show="logger.isFiltered()" class="reset btn btn-default pull-right" ng-click="logger.reset()">',
'    <i class="glyphicon glyphicon-repeat"></i>',
'    Reset filters',
'    </button>',
'    <h4 ng-if="logger.getTitle()" translate>logs.title</h4>',
'    <hr>',
'    <ol class="breadcrumb" ng-if="logger.log">    ',
'        <li class="active" ng-if="logger.log">',
'            <a href="javascript:void(0);" ng-click="logger.closeLog()" title="">',
'            <span translate>logs.all</span> <span class="badge">{{::logger.logs.length}}</span>',
'            </a>',
'        </li>',
'    <li class="active" ng-if="logger.log.trusted">{{::logger.log.changed.subject}}</li>',
'    <li class="active" ng-if="!logger.log.trusted">{{::logger.log.type}}</li>',
'    </ol>',
'    <table class="table table-condensed" ng-if="!logger.log">',
'        <thead ng-if="logger.filter">',
'            <tr>',
'            <th class="header-filter">',
'                <date model="logger.date"></date>',
'            </th>',
'            <th class="header-filter">',
'                <select class="pull-right form-control input-sm" ng-model="logger.admin"',
'                ng-options="t.key as t.value for t in logger.senders" choosen>',
'                </select>',
'                <span translate>logs.sender</span>',
'            </th>',
'            <th class="header-filter">',
'                <select class="pull-right form-control input-sm" ng-model="logger.target"',
'                ng-options="t.key as t.value for t in logger.targets" chosen>',
'                </select>',
'                <span translate>logs.target</span>',
'            </th>',
'            <th class="header-filter">',
'                <select class="pull-right form-control input-sm" ng-model="logger.type" ',
'                ng-options="t.key as t.value for t in logger.types" chosen>',
'                </select>',
'                <span translate>logs.type</span>',
'            </th>',
'            </tr>',
'        </thead>',
'        <thead ng-if="!logger.filter">',
'            <tr>',
'                <th translate>logs.date</th>',
'                <th translate>logs.sender</th>',
'                <th translate>logs.target</th>',
'                <th translate>logs.type</th>',
'            </tr>',
'        </thead>',
'    <tbody>',
'        <tr dir-paginate="log in logger.logs | logs: logger.type:logger.admin:logger.target:logger.date | orderBy: \'-date\' | itemsPerPage: logger.itemsPerPage">',
'          <td><abbr ng-bind-html="log.date | dateFormat"></abbr></td>',
'          <td style="max-width: 10vw" class="text-overflow"><a ng-link="user({id: log.admin, tab: \'infos\'})" title="">{{::log.admin}}</a>',
'          <!--Target-->',
'          <td style="max-width: 10vw" class="text-overflow">',
'            <!--user or user\'s role modification-->',
'            <a ng-if="logger.getType(log) === \'USER\'" ng-link="user({id: log.target, tab: \'infos\'})">',
'              {{::log.target}}',
'            </a>',
'            <!--org-->',
'            <a ng-if="logger.getType(log) === \'ORG\'" ng-link="org({org: log.target, tab: \'infos\'})">',
'              <span ng-if="logger.orgsId[log.target]">{{::logger.orgsId[log.target]}}</span>',
'              <span ng-if="!logger.orgsId[log.target]">{{::log.target}}</span>',
'            </a>',
'            <!--role-->',
'            <a ng-if="logger.getType(log) === \'ROLE\'" ng-link="role({role: log.target, tab: \'infos\'})">',
'              {{::log.target}}',
'            </a>',
'            <!--refused or deleted-->',
'            <span ng-if="logger.getType(log) === \'\'">{{::log.target}}</span>',
'          </td>',
'          <!--Type-->',
'          <td>',
'            <span ng-if="!log.changed" title="{{::log.title}}">',
'                <i class="glyphicon glyphicon-{{::log.icon}}"></i>',
'                {{::\'logs.\'+log.type.split(\'_\').join(\'\').toLowerCase() | translate}}',
'            </span>  ',
'            <span ng-if="log.changed && log.type==\'EMAIL_SENT\'">',
'              <i class="glyphicon glyphicon-envelope" title="{{::log.title | translate}}"></i>',
'              <a ng-link="user({id: log.changed.recipient, tab:\'messages\', queryParams: {msgid: log.changed.id}})" >',
'                {{::log.changed.subject}}',
'              </a>',
'            </span>',
'            <span ng-if="log.type.indexOf(\'_ROLE_\') >= 0" title="{{::log.title}}">',
'              <i class="glyphicon glyphicon-{{::(log.type.indexOf(\'_ROLE_ADDED\') > 0)?\'plus\':\'minus\'}}-sign"></i>',
'              {{::log.changed.new || log.changed.old}}',
'            </span>',
'            <span ng-if="log.type.indexOf(\'_ATTRIBUTE_CHANGED\') >= 0">',
'              <i class="glyphicon glyphicon-edit"',
'                title="{{::\'logs.modification\' | translate}}"></i>',
'              <strong data-toggle="tooltip" title="{{log.title}}">',
'                {{::log.changed.fieldI18nKey | translate}}',
'              </strong>',
'            </span>',
'            <span ng-if="log.changed && log.changed.field === log.target">',
'                {{::log.type + (log.changed.field ? \' (\' + log.changed.field + \')\' : \'\')}}',
'            </span>',
'          </td>',
'        </tr>',
'        <tr ng-if="(logger.logs | logs: logger.type:logger.admin:logger.target:logger.date).length === 0">',
'          <td colspan="4" class="empty">',
'            {{\'logs.noresults\' | translate}}',
'          </td>',
'        </tr>',
'    </tbody>',
'    </table>',
'',
'    <dir-pagination-controls ng-if="!logger.log.changed && !logger.log.trusted"></dir-pagination-controls>',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/logs/logs.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/logs/logs.tpl.html', [
'<section class="logs">',
'  <logger filter="true"></logger>',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/newUser/newUser.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/newUser/newUser.tpl.html', [
'<section class="user">',
'',
'  <h4>',
'    <a ng-link="users({\'id\': \'all\'})" translate>user.userlist</a>',
'    <span>/</span>',
'    <span translate>user.new_user</span>',
'  </h4>',
'',
'  <hr>',
'',
'  <div class="panel-body" ng-if="newUser.user">',
'    <hr>',
'    <div ng-inline="templates/userForm.tpl.html" ng-init="model=newUser.user;required=newUser.required"></div>',
'    <hr>',
'    <button ng-click="newUser.save()" class="btn btn-primary pull-right" translate>user.save</button>',
'    <a ng-link="users({id: \'all\'})" class="btn btn-link pull-right" translate>user.discard</a>',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/org/org.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/org/org.tpl.html', [
'<section class="org">',
'',
'  <h4>',
'    <a ng-link="orgs({\'org\': \'all\'})" translate>org.orglist</a>',
'    <span>/</span>',
'    {{::org.org.name}}',
'  </h4>',
'',
'  <hr>',
'',
'  <div class="col-md-2">',
'    <ul class="nav nav-pills nav-stacked">',
'      <li ng-repeat="tab in org.tabs" ng-class="{active: org.tab==tab}">',
'        <a ng-link="org({org: org.org.id, tab: tab})">{{ \'tab.\' + tab | translate}}</a>',
'      </li>',
'    </ul>',
'  </div>',
'',
'  <div class="col-md-10">',
'',
'    <div class="panel panel-default" ng-class="{\'panel-danger\': org.org.pending}">',
'',
'      <div class="panel-heading text-center" ng-if="org.tab==\'infos\' && org.delegations.length > 0 && profile === \'SUPERUSER\'">',
'        <span translate>org.ohasdeleg</span>',
'        <span ng-repeat="delegation in org.delegations">',
'          <a ng-link="user({id: delegation.uid, tab: \'delegations\'})">{{ delegation.uid }}</a>{{$last ? \'\' : \', \'}}',
'        </span>',
'      </div>',
'',
'      <div class="panel-heading text-center" ng-if="org.org.pending">',
'        <span translate>org.pendingmsg</span>',
'        <button class="btn btn-default" ng-click="org.confirm()" translate>org.confirm</button>',
'      </div>',
'',
'      <div class="panel-body" ng-if="org.tab==\'infos\'">',
'        <div ng-inline="templates/orgForm.tpl.html"',
'          ng-init="model=org.org;promise=org.org.$promise;required=org.required;orgTypeValues=org.orgTypeValues"></div>',
'        <hr>',
'        <div class="pull-right">',
'          <button ng-click="org.save()" class="btn btn-primary" translate ng-disabled="orgForm.$invalid">org.save</button>',
'        </div>',
'      </div>',
'',
'      <div class="panel-body" ng-if="org.tab==\'area\'">',
'        <areas item="org.org"></areas>',
'      </div>',
'',
'      <div class="panel-body" ng-if="org.tab==\'users\'">',
'        <input type="text" class="filter-table form-control pull-right ng-pristine ng-untouched ng-valid ng-empty" ng-model="org.q" placeholder="{{\'role.filter_users\' | translate}}"></input>',
'        <i class="glyphicon glyphicon-remove-sign panel-filter-table-reset" ng-show="org.q != \'\'" ng-click="org.q = \'\'"></i>        ',
'        <h3 class="roles-title">',
'          <ng-pluralize count="org.users.length"',
'                        when="{\'0\': \'{{ &quot;role.users_none&quot; | translate }}\',',
'                               \'1\': \'{} {{ &quot;role.user&quot; | translate }}\',',
'                               \'other\': \'{} {{ &quot;role.users&quot; | translate }}\'}">',
'        </h3>',
'        <form class="form-inline">',
'          <div class="form-group">',
'            <label for="orguser" translate>org.userlabel</label>',
'            <select class="pull-right form-control input-sm" ng-model="org.user"',
'               id="orguser" ng-change="org.associate()"',
'               data-placeholder-text-single="\'...\'"',
'               ng-options="u.uid as (u.sn + \' \' + u.givenName) for u in org.notUsers" chosen>',
'            </select>',
'          </div>',
'        </form>',
'',
'        <table class="table table-striped table-condensed">',
'',
'          <thead>',
'            <tr>',
'              <th translate>users.user</th>',
'              <th translate>user.action</th>',
'            </tr>',
'          </thead>',
'',
'          <tbody>',
'            <tr dir-paginate="user in org.users | filter: org.q | itemsPerPage: org.itemsPerPage | orderBy : \'sn\'">',
'              <td>',
'                <a ng-link="user({id: user.uid, tab: \'infos\'})">{{::user.sn}} {{::user.givenName}}</a>',
'              </td>',
'              <td>',
'                <a href="javascript:void(0)" ng-click="org.associate(user.uid, true)" class="text-danger" title="{{org.i18n.remove}}">',
'                  <i class="glyphicon glyphicon-remove"></i>',
'                </a>',
'              </td>',
'            </tr>',
'          </tbody>',
'',
'        </table>',
'',
'        <dir-pagination-controls></dir-pagination-controls>',
'',
'      </div>',
'',
'      <div class="panel-body" ng-if="org.tab==\'manage\'">',
'        <div class="alert alert-danger clearfix">',
'          <i class="glyphicon glyphicon-exclamation-sign"></i>',
'          <span translate>org.warning</span>',
'          <button ng-confirm-click="{{ \'org.delete\' | translate}} ?" confirmed-click="org.delete()" class="btn btn-danger" translate>org.delete</button>',
'        </div>',
'      </div>',
'',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/orgs/orgs.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/orgs/orgs.tpl.html', [
'<section class="orgs">',
'',
'  <div class="col-md-4 aside">',
'',
'    <div class="alert alert-info">',
'      <a ng-link="orgs({org: \'all\'})" class="category" ng-class="{active: orgs.org==\'all\'}" translate>orgs.allorgs</a>',
'      <a ng-link="orgs({org: \'pending\'})" class="category" ng-class="{active: orgs.org==\'pending\'}" translate>orgs.pending</a>',
'      <hr ng-if="profile === \'SUPERUSER\'">',
'      <div class="create-btn" ng-if="profile === \'SUPERUSER\'">',
'        <a ng-click="orgs.create()" class="btn btn-default" translate>orgs.neworg</a>',
'      </div>',
'    </div>',
'',
'  </div>',
'',
'  <div class="col-md-8">',
'',
'    <input type="text" class="filter-table form-control pull-right" ng-model="orgs.q" placeholder="{{\'orgs.filter_orgs\' | translate}}"></input>',
'    <i class="glyphicon glyphicon-remove-sign filter-table-reset" ng-show="orgs.q != \'\'" ng-click="orgs.q = \'\'"></i>',
'    <h3 class="roles-title">',
'    <ng-pluralize count="orgs.simplifiedOrgs.length"',
'                  when="{\'0\': \'{{ &quot;orgs.title_none&quot; | translate }}\',',
'                         \'1\': \'{} {{ &quot;orgs.title_one&quot; | translate }}\',',
'                         \'other\': \'{} {{ &quot;orgs.title_plural&quot; | translate }}\'}">',
'    </h3>',
'    <table class="table table-striped table-condensed">',
'',
'      <thead>',
'        <tr>',
'          <th translate>org.name</th>',
'          <th translate>org.shortName</th>',
'          <th translate>org.membersCount</th>',
'        </tr>',
'      </thead>',
'',
'      <tbody>',
'        <tr dir-paginate="org in orgs.simplifiedOrgs | filter:orgs.q | filter: {pending: orgs.org===\'pending\'} | itemsPerPage: orgs.itemsPerPage">',
'          <td>',
'            <a ng-link="org({org: org.id, tab: \'infos\'})" ng-class="{pending: org.status !== \'REGISTERED\'}">',
'              {{::org.name}}',
'            </a>',
'          </td>',
'          <td>{{::org.shortName}}</td>',
'          <td>{{::org.membersCount}}</td>',
'        </tr>',
'      </tbody>',
'',
'    </table>',
'',
'    <dir-pagination-controls></dir-pagination-controls>',
'',
'  </div>',
'',
'  <div ng-if="orgs.newOrg" class="background" ng-cloack>',
'',
'    <div class="panel panel-default">',
'',
'      <div class="panel-heading">',
'        <a class="btn close" ng-click="orgs.close()">&times;</a>',
'        <span translate>orgs.neworg</span>',
'      </div>',
'      <div class="panel-body">',
'        <form class="form-horizontal" name="orgForm">',
'',
'          <div ng-inline="templates/orgForm.tpl.html"',
'             ng-init="model=orgs.newInstance;promise=orgs.newInstance.$promise;required=orgs.required;orgTypeValues=orgs.orgTypeValues"></div>',
'',
'          <hr>',
'          <button class="btn btn-primary pull-right" ng-disabled="orgForm.$invalid" ng-click="orgs.saveOrg()">',
'            <span translate>users.save</span>',
'          </button>',
'          <button class="btn btn-link pull-right" ng-click="orgs.close()" translate>users.cancel</button>',
'        </form>',
'      </div>',
'',
'    </div>',
'',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/role/role.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/role/role.tpl.html', [
'<section class="role">',
'',
'  <h4>',
'    <a ng-link="roles({\'role\': \'all\'})" translate>role.rolelist</a>',
'    <span>/</span>',
'    {{::role.role.cn}}',
'  </h4>',
'',
'  <hr>',
'',
'  <div class="col-md-2">',
'    <ul class="nav nav-pills nav-stacked">',
'      <li ng-repeat="tab in role.tabs" ng-class="{active: role.tab==tab}">',
'        <a ng-link="role({role: role.role.cn, tab: tab})"',
'          ng-if="!isProtectedRole(role.role) || tab != \'manage\'">{{ \'tab.\' + tab | translate}}</a>',
'      </li>',
'    </ul>',
'  </div>',
'',
'  <div class="col-md-10">',
'',
'    <div class="panel panel-default">',
'',
'      <div class="panel-body" ng-if="role.tab==\'infos\'">',
'        <div ng-inline="templates/roleForm.tpl.html"',
'          ng-init="model=role.role;promise=role.role.$promise;required=role.required;roleTypeValues=role.roleTypeValues"></div>',
'        <hr ng-if="!isProtectedRole(role.role)">',
'        <div class="pull-right" ng-if="!isProtectedRole(role.role)">',
'          <button ng-click="role.save()" class="btn btn-primary" translate>role.save</button>',
'        </div>',
'      </div>',
'',
'      <div class="panel-body" ng-if="role.tab==\'users\'">',
'        <input type="text" class="filter-table form-control pull-right ng-pristine ng-untouched ng-valid ng-empty" ng-model="role.q" placeholder="{{\'role.filter_users\' | translate}}"></input>',
'        <i class="glyphicon glyphicon-remove-sign panel-filter-table-reset" ng-show="role.q != \'\'" ng-click="role.q = \'\'"></i>',
'        <h3 class="roles-title">',
'          <ng-pluralize count="role.users.length"',
'                        when="{\'0\': \'{{ &quot;role.users_none&quot; | translate }}\',',
'                               \'1\': \'{} {{ &quot;role.user&quot; | translate }}\',',
'                               \'other\': \'{} {{ &quot;role.users&quot; | translate }}\'}">',
'        </h3>',
'        <form class="form-inline">',
'          <div class="form-group">',
'            <label for="role" translate>role.userlabel</label>',
'            <select class="pull-right form-control input-sm" ng-model="role.user"',
'               id="role" ng-change="role.associate()"',
'               data-placeholder-text-single="\'...\'"',
'               ng-options="u.uid as (u.sn + \' \' + u.givenName) for u in role.notUsers" chosen>',
'            </select>',
'          </div>',
'        </form>',
'',
'        <table class="table table-striped table-condensed">',
'',
'          <thead>',
'            <tr>',
'              <th translate>users.user</th>',
'              <th translate>user.action</th>',
'            </tr>',
'          </thead>',
'',
'          <tbody>',
'            <tr dir-paginate="user in role.users | filter:role.q | itemsPerPage: role.itemsPerPage | orderBy : \'sn\'">',
'              <td>',
'                <a ng-link="user({id: user.uid, tab: \'infos\'})">{{::user.sn}} {{::user.givenName}}</a>',
'              </td>',
'              <td>',
'                <a href="javascript:void(0)" ng-click="role.associate(user.uid, true)" class="text-danger" title="{{role.i18n.remove}}">',
'                  <i class="glyphicon glyphicon-remove"></i>',
'                </a>',
'              </td>',
'            </tr>',
'          </tbody>',
'',
'        </table>',
'',
'        <dir-pagination-controls></dir-pagination-controls>',
'',
'      </div>',
'',
'      <div class="panel-body" ng-if="role.tab==\'manage\'">',
'        <div class="alert alert-danger clearfix">',
'          <i class="glyphicon glyphicon-exclamation-sign"></i>',
'          <span translate>role.warning</span>',
'          <button ng-click="role.delete()" class="btn btn-danger" translate>role.delete</button>',
'        </div>',
'      </div>',
'',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/roles/roles.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/roles/roles.tpl.html', [
'<section class="roles">',
'',
'  <div class="col-md-4 aside">',
'',
'    <div class="alert alert-info">',
'      <a ng-link="roles({role: \'all\'})" class="category" ng-class="{active: roles.role==\'all\'}" translate>roles.allroles</a>',
'      <hr ng-if="profile === \'SUPERUSER\'"/>',
'      <div class="create-btn" ng-if="profile === \'SUPERUSER\'">',
'        <a ng-click="roles.create()" class="btn btn-default" translate>roles.newrole</a>',
'      </div>',
'    </div>',
'',
'  </div>',
'',
'  <div class="col-md-8">',
'',
'    <input type="text" class="filter-table form-control pull-right" ng-model="roles.q" placeholder="{{\'roles.filter_roles\' | translate}}"></input>',
'    <i class="glyphicon glyphicon-remove-sign filter-table-reset" ng-show="roles.q != \'\'" ng-click="roles.q = \'\'"></i>',
'    <h3 class="roles-title">',
'    <ng-pluralize count="roles.roles.length"',
'                  when="{\'0\': \'{{ &quot;roles.title_none&quot; | translate }}\',',
'                         \'1\': \'{} {{ &quot;roles.title_one&quot; | translate }}\',',
'                         \'other\': \'{} {{ &quot;roles.title_plural&quot; | translate }}\'}">',
'    </h3>',
'',
'    <table class="table table-striped table-condensed">',
'',
'      <thead>',
'        <tr>',
'          <th translate>role.cn</th>',
'          <th translate>role.membersCount</th>',
'        </tr>',
'      </thead>',
'',
'      <tbody>',
'        <tr dir-paginate="role in roles.roles | filter:roles.q | itemsPerPage: roles.itemsPerPage">',
'          <td>',
'            <a ng-link="role({role: role.cn, tab: \'infos\'})" title={{::role.description}}>',
'              {{::role.cn}}',
'            </a>',
'            &nbsp;<i class="glyphicon glyphicon-star-empty" ng-if="role.isFavorite && profile === \'SUPERUSER\'"></i>',
'          </td>',
'          <td>{{::role.usersCount}}</td>',
'        </tr>',
'      </tbody>',
'',
'    </table>',
'',
'    <dir-pagination-controls></dir-pagination-controls>',
'',
'  </div>',
'',
'  <div ng-if="roles.newRole" class="background" ng-cloack>',
'',
'    <div class="panel panel-default">',
'',
'      <div class="panel-heading">',
'        <a class="btn close" ng-click="roles.close()">&times;</a>',
'        <span translate>roles.newrole</span>',
'      </div>',
'      <div class="panel-body">',
'        <form class="form-horizontal" name="roleForm">',
'',
'          <div ng-inline="templates/roleForm.tpl.html"',
'             ng-init="model=roles.newInstance;promise=roles.newInstance.$promise;required=roles.required;"></div>',
'',
'          <hr>',
'          <button class="btn btn-primary pull-right" ng-disabled="roleForm.$invalid" ng-click="roles.saveRole()">',
'            <span translate>users.save</span>',
'          </button>',
'          <button class="btn btn-link pull-right" ng-click="roles.close()" translate>users.cancel</button>',
'        </form>',
'      </div>',
'',
'    </div>',
'',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/stats/stats.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/stats/stats.tpl.html', [
'<div class="stats">',
'',
'  <div class="btn-group pull-right" role="role">',
'    <button ng-click="stats.switchView()" type="button" class="btn btn-default" ng-class="{\'active\': stats.view ==\'graph\'}" title="{{\'analytics.graphview\' | translate}}">',
'      <i class="glyphicon glyphicon-stats"></i>',
'    </button>',
'    <button ng-click="stats.switchView()" type="button" class="btn btn-default" ng-class="{\'active\': stats.view ==\'table\'}" title="{{\'analytics.dataview\' | translate}}">',
'      <i class="glyphicon glyphicon-th-list"></i>',
'    </button>',
'  </div>',
'',
'  <h4>',
'    {{stats.title | translate}}',
'    <span ng-if="stats.data.granularity">',
'      {{\'analytics.\' + stats.data.granularity | translate}}',
'    </span>',
'  </h4>',
'',
'  <div ng-show="stats.nodata && stats.data.$resolved" class="alert alert-warning">',
'    <i class="glyphicon glyphicon-alert"></i>&nbsp;',
'    <span translate>analytics.nodata</span>',
'  </div>',
'',
'  <div ng-show="!stats.data.$resolved" class="progress">',
'    <div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%">',
'    </div>',
'  </div>',
'',
'  <div class="chartist" ng-show="stats.view==\'graph\' && stats.data.$resolved && !stats.nodata"></div>',
'',
'  <table class="table table-bordered table-striped" ng-show="stats.view==\'table\'">',
'    <tr ng-repeat="value in stats.serie track by $index">',
'      <td ng-if="stats.type === \'bar\'">{{stats.parsed.labels[$index]}}</td>',
'      <td ng-if="stats.type !== \'bar\'">{{stats.parsed.labels[stats.serie.length - $index -1]}}</td>',
'      <td>{{value}}</td>',
'    </tr>',
'  </table>',
'',
'  <!-- Download graph as PNG -->',
'  <button ng-click="stats.exportPNG()" class="btn btn-default btn-sm center-block" title="{{ \'analytics.saveAsPNG\' | translate }}"',
'    ng-show="stats.view==\'graph\' && stats.data.$resolved && !stats.nodata">',
'    <i class="glyphicon glyphicon-save"></i>',
'  </button>',
'',
'  <!-- Export data as CSV -->',
'  <button ng-click="stats.exportCSV()" class="btn btn-default btn-sm center-block" title="{{ \'analytics.saveAsCSV\' | translate }}"',
'          ng-show="stats.view==\'table\' && stats.csvConfig && stats.data.$resolved && !stats.nodata">',
'    <i class="glyphicon glyphicon-save"></i>',
'  </button>',
'',
'</div>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/user/user.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/user/user.tpl.html', [
'<section class="user">',
'',
'  <h4>',
'    <a ng-link="users({\'id\': \'all\'})" translate>user.userlist</a>',
'    <span>/</span>',
'    {{::user.user.sn}} {{::user.user.givenName}}',
'  </h4>',
'',
'  <hr>',
'',
'  <div class="col-md-2">',
'    <ul class="nav nav-pills nav-stacked">',
'      <li ng-repeat="tab in user.tabs" ng-class="{active: user.tab==tab}">',
'        <a ng-link="user({id: user.user.uid, tab: tab})">{{ \'tab.\' + tab | translate}}</a>',
'      </li>',
'    </ul>',
'  </div>',
'',
'  <div class="col-md-10">',
'    <div class="panel panel-default" ng-class="{\'panel-danger\': user.user.pending, \'panel-warning\': user.user.expired}">',
'',
'      <div class="panel-heading text-center" ng-if="user.user.pending">',
'        <span translate>user.pendingmsg</span>',
'        <button class="btn btn-default" ng-click="user.confirm()"',
'          ng-show="user.user.validOrg" translate>user.confirm</button>',
'        <span ng-if="!user.user.validOrg">',
'          —',
'          <span translate>user.orgFirst</span>',
'          <a ng-link="org({org: user.user.orgObj.id, tab: \'infos\'})">',
'            {{::user.user.orgObj.name || user.user.orgObj.shortName}}',
'          </a>',
'        </span>',
'      </div>',
'',
'      <div class="panel-heading text-center" ng-if="user.user.expired">',
'        <span translate>user.expiredmsg</span> : <span ng-bind-html="user.user.shadowExpire | dateFormat: \'LL\'"></span>',
'      </div>',
'',
'      <div class="panel-body" ng-if="user.tab==\'infos\'">',
'',
'        <div ng-inline="templates/userForm.tpl.html"',
'          ng-init="model=user.user;promise=user.user.$promise;required=user.required"></div>',
'        <hr>',
'',
'        <div class="pull-right">',
'          <button ng-click="user.save()" class="btn btn-primary" translate data-ng-disabled="!adminUserForm.$valid">user.save</button>',
'        </div>',
'',
'      </div>',
'',
'      <div class="panel-body" ng-if="user.tab==\'roles\'">',
'',
'        <h4 translate>role.system</h4>',
'        <div class="form-group clearfix">',
'          <div class="col-sm-6" ng-repeat="role in user.adminRoles" ng-if="user.allroles.indexOf(role) !== -1 && !user.isUnassignableRole(role)">',
'            <div class="checkbox" title="{{user.roleDescriptions[role]}}">',
'              <label>',
'                <input type="checkbox" ng-model="user.user.adminRoles[role]"> {{::role}}',
'              </label>',
'            </div>',
'          </div>',
'        </div>',
'',
'        <hr>',
'',
'        <h4 translate>role.app</h4>',
'        <div class="form-group" ng-if="$translate.isReady()">',
'          <select class="form-control" multiple ng-model="user.user.roles"',
'             ng-options="role for role in user.roles" chosen',
'             placeholder-text-multiple="\'user.select_role\'|translate">',
'          </select>',
'        </div>',
'      </div>',
'',
'      <div class="panel-heading text-center" ng-if="user.tab==\'delegations\' && profile === \'SUPERUSER\'">',
'        <span ng-if="user.activeDelegation" class="delegation_active" translate>user.hasdeleg</span>',
'        <span ng-if="!user.activeDelegation" class="delegation_inactive" translate>user.nodeleg</span>',
'      </div>',
'',
'      <div class="panel-body" ng-if="user.tab==\'delegations\' && profile === \'SUPERUSER\' && isSuperUser(user.user)">',
'        <p class="text-danger text-center delegation_restricted" translate>delegation.restricted</p>',
'      </div>',
'',
'      <div class="panel-body" ng-if="user.tab==\'delegations\' && profile === \'SUPERUSER\' && !isSuperUser(user.user)">',
'        <h4 translate>user.manages_roles</h4>',
'        <div class="form-group">',
'          <select class="form-control" multiple chosen ng-model="user.delegation.roles" ng-options="role for role in user.allroles"',
'          data-placeholder="Select roles">',
'          </select>',
'        </div>',
'        <h4 translate>user.manages_orgs</h4>',
'        <div class="form-group">',
'          <select class="form-control" multiple chosen ng-model="user.delegation.orgs" ng-options="org.id as org.name for org in user.orgs"',
'          data-placeholder="Select orgs">',
'          </select>',
'        </div>',
'        <br>',
'        <hr>',
'        <div class="pull-right">',
'          <button ng-disabled="!user.activeDelegation" ng-click="user.deleteDelegation()" class="btn btn-link" translate>delegations.delete</button>',
'          <button ng-disabled="!user.hasDelegation()" ng-click="user.saveDelegation()" class="btn btn-primary" translate>user.save</button>',
'        </div>',
'      </div>',
'',
'      <div class="panel-body user-analytics" ng-if="user.tab==\'analytics\'">',
'        <date class="stats-conf" model="user.date" callback="user.loadAnalyticsData()"></date>',
'        <h4 translate>analytics.title</h4>',
'        <hr>',
'        <div class="row">',
'          <stats data="user.requests" type="\'line\'" config="user.config.requests"',
'                 title="\'analytics.requests\'" class="col-md-6"/>',
'          <stats data="user.layers" type="\'bar\'" config="user.config.layers"',
'                 title="\'analytics.layers\'" class="col-md-6" csv-config="user.usageOptions"/>',
'        </div>',
'        <hr>',
'        <div class="row" ng-if="platformInfos.extractorappEnabled">',
'          <stats data="user.extractions" type="\'bar\'" config="user.config.extractions"',
'                 title="\'analytics.extractions\'" class="col-md-6" csv-config="user.extractionOptions"/>',
'        </div>',
'      </div>',
'      <!--message tab to list all readables messages-->',
'      <div class="panel-body user-messages" ng-if="user.tab==\'messages\'">',
'',
'        <ol class="breadcrumb">',
'          <button class="pull-right btn btn-link btn-xs" ng-if="!user.compose && !user.message" translate ng-click="user.compose={}">msg.compose</button>',
'          <li class="active" ng-if="!user.message && !user.compose">',
'            <span translate>msg.messages</span> <span class="badge">{{::user.messages.emails.length}}</span>',
'          </li>',
'          <li ng-if="user.message || user.compose">',
'            <a href="javascript:void(0);" ng-click="user.closeMessage()">',
'              <span translate>msg.messages</span> <span class="badge">{{::user.messages.emails.length}}</span>',
'            </a>',
'          </li>',
'          <li class="active" ng-if="user.compose" translate>msg.compose</li>',
'          <li class="active" ng-if="user.message">{{::user.message.subject}}</li>',
'        </ol>',
'        <label ng-if="user.compose && user.templates.templates.length > 0" class="pull-right clearfix">',
'          <span translate>msg.templates</span>',
'          <select placeholder="{{ \'msg.templates\' | translate }}" ng-change="user.loadTemplate()"',
'            ng-options="template.name for template in user.templates.templates" ng-model="user.compose.template"></select>',
'        </label>',
'',
'        <form ng-if="user.compose" class="" ng-init="user.initCompose()">',
'          <div class="form-group">',
'            <label for="compose_title" translate>msg.title</label>',
'            <div>',
'              <input ng-model="user.compose.subject" class="form-control" id="compose_title" placeholder="{{\'msg.title\' | translate}}">',
'            </div>',
'          </div>',
'          <div class="form-group">',
'            <label for="compose_content" translate>msg.content</label>',
'            <div id="compose_content"></div>',
'          </div>',
'',
'          <h5 translate ng-if="user.attachments.attachments.length > 0">msg.attachments</h5>',
'          <div class="clearfix">',
'            <div class="col-sm-4" ng-repeat="attachment in user.attachments.attachments">',
'              <div class="checkbox">',
'                <label>',
'                  <input type="checkbox" ng-model="user.compose.attachments[attachment.id]"> {{::attachment.name}}',
'                </label>',
'              </div>',
'            </div>',
'          </div>',
'',
'          <hr>',
'',
'          <div class="pull-right">',
'            <button ng-click="user.closeMessage()" class="btn btn-link" translate>msg.cancel</button>',
'            <button ng-click="user.sendMail()" class="btn btn-primary" translate>msg.send</button>',
'          </div>',
'',
'        </form>',
'        <div ng-if="user.message">',
'          <h4>',
'            <small>',
'              {{user.message.sender}}, <span translate>msg.on</span> {{user.message.date | date: \'mediumDate\'}}',
'            </small>',
'          </h4>',
'          <h4>',
'            {{user.message.subject}}',
'          </h4>',
'          <p ng-bind-html="user.message.trusted"></p>',
'          <hr ng-if="user.message.attachments.length>0" />',
'          <h5 ng-if="user.message.attachments.length>0" translate>msg.attachments</h5>',
'          <ul ng-if="user.message.attachments.length>0">',
'            <li ng-repeat="attachment in user.message.attachments">',
'              {{attachment.name}}',
'            </li>',
'          </ul>',
'        </div>',
'        <table class="table table-condensed" ng-if="!user.message && !user.compose">',
'          <thead>',
'            <tr>',
'              <th translate>msg.date</th>',
'              <th translate>msg.subject</th>',
'              <th translate>msg.sender</th>',
'            </tr>',
'          </thead>',
'          <tbody>',
'            <tr ng-repeat="message in user.messages.emails">',
'              <td>{{::message.date | date: \'mediumDate\'}}</td>',
'              <td>',
'                <a href="javascript:void(0)" ng-click="user.openMessage(message)">',
'                  {{::message.subject}}<em ng-if="message.subject==\'\'" translate>msg.nosubject</em>',
'                </a>',
'              </td>',
'              <td>{{::message.sender}}</td>',
'            </tr>',
'            <tr ng-if="user.messages.emails.length == 0">',
'              <td colspan="3">',
'                <div class="alert alert-info" translate>msg.empty</div>',
'              </td>',
'            </tr>',
'          </tbody>',
'        </table>',
'      </div>',
'      <!--log breadcrumb-->',
'      <div class="panel-body" ng-if="user.tab==\'logs\'">',
'        <h4 translate>user.logs</h4>',
'        <!--logs component-->',
'        <logger filter="false" title="false" user="user.uid"></logger>',
'      </div>',
'',
'      <div class="panel-body" ng-if="user.tab==\'manage\'">',
'        <div class="alert alert-danger clearfix">',
'          <i class="glyphicon glyphicon-exclamation-sign"></i>',
'          <span translate>user.warning</span>',
'          <button  ng-click="user.delete()" class="btn btn-danger" translate>user.delete</button>',
'        </div>',
'      </div>',
'',
'    </div>',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("components/users/users.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('components/users/users.tpl.html', [
'<section class="users">',
'',
'  <browse class="col-md-4 roles aside" roles="users.roles" active-promise="users.activePromise"></browse>',
'',
'  <div class="col-md-8">',
'',
'    <input type="text" class="filter-table form-control pull-right" ng-model="users.q" placeholder="{{\'role.filter_users\' | translate}}"></input>',
'    <i class="glyphicon glyphicon-remove-sign filter-table-reset" ng-show="users.q != \'\'" ng-click="users.q = \'\'"></i>',
'    <h3 ng-if="!users.activeRole" class="roles-title">',
'      <ng-pluralize count="(users.users | filter: users.q | filter:users.selectionFilter).length"',
'                    when="{\'0\': \'{{ &quot;role.users_none&quot; | translate }}\',',
'                           \'1\': \'{} {{ &quot;role.user&quot; | translate }}\',',
'                           \'other\': \'{} {{ &quot;role.users&quot; | translate }}\'}">',
'    </h3>',
'    <h3 ng-if="users.activeRole" class="roles-title">',
'      {{(\'users.\'+users.activeRole.cn | translate).replace(\'users.\', \'\')}}',
'    </h3>',
'    <p ng-if="users.activeRole">',
'      <em class="content-description">{{users.activeRole.description | translate}}</em>',
'    </p>',
'',
'    <table class="table table-striped table-condensed">',
'',
'      <thead>',
'        <tr>',
'          <th>',
'            <div class="btn-group users-selection">',
'              <button type="button" class="btn btn-primary" ng-if="users.selection.length>0">',
'                {{users.selection.length}}',
'              </button>',
'              <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',
'                <span class="caret"></span>',
'              </button>',
'              <ul class="dropdown-menu">',
'                <li><a href="javascript:void(0)" ng-click="users.select(\'none\')" translate>sel.none</a></li>',
'                <li><a href="javascript:void(0)" ng-click="users.select(\'all\')" translate>sel.all</a></li>',
'                <li role="separator" class="divider" ng-show="users.selection.length !== 0"></li>',
'                <li><a href="javascript:void(0)" ng-click="users.exportCSV()" ng-show="users.selection.length !== 0" translate>sel.export_csv</a></li>',
'                <li><a href="javascript:void(0)" ng-click="users.exportVCF()" ng-show="users.selection.length !== 0" translate>sel.export_vcard</a></li>',
'              </ul>',
'            </div>',
'          </th>',
'          <th translate>users.user</th>',
'          <th translate>users.login</th>',
'          <th translate>users.organization</th>',
'          <th translate>users.email</th>',
'        </tr>',
'      </thead>',
'',
'      <tbody>',
'        <tr dir-paginate="user in users.users | filter:users.q | filter:users.selectionFilter | itemsPerPage: users.itemsPerPage | orderBy : \'sn\' | filter: {pending: users.activeRole.cn===\'PENDING\'}">',
'          <td class="users-checkboxes">',
'            <input type="checkbox" ng-click="users.toggleSelected(user.uid)" ng-checked="users.selection.indexOf(user.uid)>=0">',
'          </td>',
'          <td>',
'            <a ng-link="user({id: user.uid, tab: \'infos\'})">{{::user.sn}} {{::user.givenName}}</a>',
'          </td>',
'          <td style="max-width: 10vw;" class="text-overflow" title="{{::user.uid}}"> {{::user.uid}}</td>',
'          <td>',
'            <a ng-link="org({org: user.orgId, tab: \'infos\'})">{{::user.org}}</a>',
'          </td>',
'          <td>{{::user.mail}}</td>',
'        </tr>',
'      </tbody>',
'',
'    </table>',
'',
'    <label class="pull-right checkbox">',
'      <input type="checkbox" ng-model="users.filterSelected"></input>',
'      <span translate>users.filter_selected</span>',
'    </label>',
'    <dir-pagination-controls></dir-pagination-controls>',
'',
'  </div>',
'',
'</section>',
'',''].join("\n"));
  }]);
})();
});

require.register("templates/dirPagination.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('templates/dirPagination.tpl.html', [
'<ul class="pagination" ng-if="1 < pages.length || !autoHide">',
'    <li ng-if="boundaryLinks" ng-class="{ disabled : pagination.current == 1 }">',
'        <a ng-click="setCurrent(1)">&laquo;</a>',
'    </li>',
'    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == 1 }">',
'        <a ng-click="setCurrent(pagination.current - 1)">&lsaquo;</a>',
'    </li>',
'    <li ng-repeat="pageNumber in pages track by tracker(pageNumber, $index)" ng-class="{ active : pagination.current == pageNumber, disabled : pageNumber == \'...\' }">',
'        <a ng-click="setCurrent(pageNumber)">{{ pageNumber }}</a>',
'    </li>',
'',
'    <li ng-if="directionLinks" ng-class="{ disabled : pagination.current == pagination.last }">',
'        <a ng-click="setCurrent(pagination.current + 1)">&rsaquo;</a>',
'    </li>',
'    <li ng-if="boundaryLinks"  ng-class="{ disabled : pagination.current == pagination.last }">',
'        <a ng-click="setCurrent(pagination.last)">&raquo;</a>',
'    </li>',
'</ul>',
'',''].join("\n"));
  }]);
})();
});

require.register("templates/orgForm.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('templates/orgForm.tpl.html', [
'<form class="form-horizontal" name="orgForm">',
'',
'  <div ng-if="!model">no model</div>',
'',
'  <div class="row org-form">',
'',
'    <div class="col-md-12">',
'',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.name}">',
'        <label class="col-sm-4" for="name" translate>org.name</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.name" class="form-control" id="name"',
'            placeholder="" ng-required="required.name">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.shortName}">',
'        <label class="col-sm-4" for="shortName" translate>org.shortName</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.shortName" class="form-control" id="shortName"',
'            placeholder="" ng-required="required.shortName" shortname shortname-lower>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.type}">',
'        <label class="col-sm-4" for="type" translate>org.type</label>',
'        <div class="col-sm-8">',
'          <select ng-model="model.orgType" class="form-control" id="type"',
'            placeholder="" ng-required="required.type">',
'            <option ng-repeat="o in orgTypeValues" value="{{o}}">{{::o}}</option>',
'          </select>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.address}">',
'        <label class="col-sm-4" for="address" translate>org.address</label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.address" class="form-control" id="address"',
'                    placeholder="" ng-required="required.address"></textarea>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.description}">',
'        <label class="col-sm-4" for="address">',
'          <span translate>org.description</span><br>',
'          <small class="text-muted" style="font-weight: normal" translate>org.maxdesc</small>',
'        </label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.description" class="form-control" id="description" maxlength="255"',
'                    placeholder="{{ \'org.maxdesc\' | translate }}" ng-required="required.description"></textarea>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.note}">',
'        <label class="col-sm-4" for="note" translate>org.note</label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.note" class="form-control" id="note"',
'            placeholder="" ng-required="required.note"></textarea>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.url}">',
'        <label class="col-sm-4" for="url" translate>org.url</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.url" class="form-control" id="url" type="url"',
'            placeholder="" ng-required="required.url">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.mail}">',
'        <label class="col-sm-4" for="mail" translate>org.mail</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.mail" class="form-control" id="mail" type="mail"',
'                 placeholder="" ng-required="required.mail">',
'        </div>',
'      </div>',
'      <div class="form-group form-group-sm" ng-class="{required: required.orgUniqueId}">',
'        <label class="col-sm-4" for="orgUniqueId" translate>org.orgUniqueId</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.orgUniqueId" class="form-control" id="orgUniqueId"',
'                 placeholder="">',
'        </div>',
'      </div>',
'',
'      <imageinput model="model" attribute="\'logo\'"></imageinput>',
'',
'    </div>',
'',
'  </div>',
'',
'</form>',
'',''].join("\n"));
  }]);
})();
});

require.register("templates/roleForm.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('templates/roleForm.tpl.html', [
'<form class="form-horizontal">',
'',
'  <div ng-if="!model">pas de model</div>',
'',
'  <div class="row role-form">',
'',
'    <div class="col-md-12">',
'',
'',
'      <div class="form-group form-group-sm required">',
'        <label class="col-sm-4" for="cn" translate>role.cn</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.cn" class="form-control" id="cn"',
'            placeholder="" ng-required="true" ng-readonly="isProtectedRole(model)" shortname>',
'           <p class="help-block" translate>role.helpFormat</p>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm">',
'        <label class="col-sm-4" for="newRoleDesc" translate>role.description</label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.description" class="form-control" id="newRoleDesc"',
'                    ng-readonly="isProtectedRole(model)"',
'                    placeholder=""></textarea>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-if="!isProtectedRole(model)">',
'        <label class="col-sm-4" for="favorite" translate>role.favorite</label>',
'        <div class="col-sm-8">',
'          <input type="checkbox" ng-model="model.isFavorite" id="favorite">',
'        </div>',
'      </div>',
'',
'    </div>',
'',
'  </div>',
'',
'</form>',
'',''].join("\n"));
  }]);
})();
});

require.register("templates/userForm.tpl.html", function(exports, require, module) {
(function() {
  var module;

  try {
    // Get current templates module
    module = angular.module('manager');
  } catch (error) {
    // Or create a new one
    module = angular.module('manager', []);
  }

  module.run(['$templateCache', function($templateCache) {
    return $templateCache.put('templates/userForm.tpl.html', [
'<form class="form-horizontal" name="adminUserForm">',
'',
'  <div ng-if="!model">no model</div>',
'',
'  <div class="row user-form" ng-init="view={edit_login: false}">',
'',
'    <div class="col-md-6">',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.sn}">',
'        <label class="col-sm-4" for="sn" translate>user.sn</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.sn" class="form-control" id="sn" placeholder="{{\'user.sn\' | translate}}" ng-required="required.sn">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.givenName}">',
'        <label class="col-sm-4" for="givenName" translate>user.gn</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.givenName" class="form-control" id="givenName" placeholder="{{\'user.gn\' | translate}}" ng-required="required.givenName">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.cn}">',
'        <label class="col-sm-4" for="commonName" translate>user.cn</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.cn" class="form-control" id="commonName" placeholder="{{\'user.cn\' | translate}}" disabled ng-required="required.cn">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.mail}">',
'        <label class="col-sm-4" for="email" translate>user.mail</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.mail" type="email" class="form-control" id="email" placeholder="{{\'user.mail\' | translate}}" ng-required="required.mail">',
'        </div>',
'      </div>',
'      <div class="form-group form-group-sm" ng-class="{required: required.postalAddress}">',
'        <label class="col-sm-4" for="address" translate>user.address</label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.postalAddress" class="form-control" id="address" placeholder="{{\'user.address\' | translate}}" ng-required="required.postalAddress"></textarea>',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.org}">',
'        <label class="col-sm-4" for="organization" translate>user.org</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.org" class="form-control" id="organization" organizations model="model" promise="promise" placeholder="{{\'user.org\' | translate}}" ng-required="required.org">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.description}">',
'        <label class="col-sm-4" for="organization" translate>user.description</label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.description" class="form-control" id="description" placeholder="{{\'user.description\' | translate}}" ng-required="required.description"></textarea>',
'        </div>',
'      </div>',
'      <div class="form-group form-group-sm" ng-class="{required: required.manager}">',
'        <label class="col-sm-4" for="manager" translate>user.manager</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.manager" class="manager form-control" id="manager" managers promise="promise" ng-required="required.manager">',
'        </div>',
'      </div>',
'      <div class="form-group form-group-sm" ng-class="{required: required.shadowExpire}">',
'        <label class="col-sm-4" for="shadowExpire" translate>user.expire</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.shadowExpire" class="form-control" id="shadowExpire" placeholder="{{\'user.expire\' | translate}}" datepicker ng-required="required.shadowExpire">',
'        </div>',
'      </div>',
'',
'    </div>',
'',
'    <div class="col-md-6">',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.telephoneNumber}">',
'        <label class="col-sm-4" for="phone" translate>user.phone</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.telephoneNumber" class="form-control" id="phone" placeholder="{{\'user.phone\' | translate}}" ng-required="required.telephoneNumber">',
'        </div>',
'      </div>',
'      <div class="form-group form-group-sm" ng-class="{required: required.facsimileTelephoneNumber}">',
'        <label class="col-sm-4" for="fax" translate>user.fax</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.facsimileTelephoneNumber" class="form-control" id="fax" placeholder="{{\'user.fax\' | translate}}" ng-required="required.facsimileTelephoneNumber">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.title}">',
'        <label class="col-sm-4" for="title" translate>user.title</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.title" class="form-control" id="title" placeholder="{{\'user.title\' | translate}}" ng-required="required.title">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.privacyPolicyAgreementDate}">',
'        <label class="col-sm-4" for="privacyPolicyAgreementDate" translate>user.privacyPolicyAgreementDate</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.privacyPolicyAgreementDate" class="form-control" id="privacyPolicyAgreementDate" disabled placeholder="{{\'user.privacyPolicyAgreementDate\' | translate}}" datepicker ng-required="required.privacyPolicyAgreementDate">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm">',
'        <label class="col-sm-4" for="creationDate" translate>user.creationDate</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.createTimestamp" class="form-control" id="creationDate" disabled placeholder="{{\'user.lastLoginUnknown\' | translate}}">',
'        </div>',
'      </div>',
'      <div class="form-group form-group-sm">',
'        <label class="col-sm-4" for="lastLogin" translate>user.lastLogin</label>',
'        <div class="col-sm-8">',
'          <input ng-model="model.authTimestamp" class="form-control" id="lastLogin" disabled placeholder="{{\'user.lastLoginUnknown\' | translate}}">',
'        </div>',
'      </div>',
'',
'      <div class="form-group form-group-sm" ng-class="{required: required.knowledgeInformation}">',
'        <label class="col-sm-4" for="knowledgeInformation" translate>user.note</label>',
'        <div class="col-sm-8">',
'          <textarea ng-model="model.knowledgeInformation" class="form-control" id="knowledgeInformation" placeholder="{{\'user.note\' | translate}}" ng-required="required.knowledgeInformation"></textarea>',
'        </div>',
'      </div>',
'',
'      <hr>',
'',
'      <div class="form-group" ng-if="model.$promise" ng-class="{required: required.uid && !model.isExternalAuth}">',
'        <label class="col-sm-4" for="uid" ng-if="!model.isExternalAuth" translate>user.login</label>',
'        <label class="col-sm-4" for="uid" ng-if="model.isExternalAuth" translate>account.external</label>',
'        <div class="col-sm-8 break-word" ng-if="!view.edit_login">',
'          <div ng-if="model.isExternalAuth"><b>{{ model.oAuth2Provider }} :</b><br></div>',
'          {{model.uid}} <span ng-if="!model.isExternalAuth">(<a href="javascript:void(0)" ng-click="view.edit_login=!view.edit_login">change</a>)</span>',
'        </div>',
'        <div class="col-sm-8" ng-if="view.edit_login">',
'          <!-- Server validation is in java/org/georchestra/console/ws/newaccount/NewAccountFormController.java -->',
'          <input ng-model="model.uid" class="form-control" id="uid" placeholder="{{\'user.login\' | translate}}" ng-required="required.uid" ng-pattern="/^[a-z][a-z0-9_\\\\.\\\\-]*$/i">',
'        </div>',
'      </div>',
'      <hr ng-if="!model.isExternalAuth">',
'',
'      <div class="form-group form-group-sm" ng-if="model.$promise && !model.isExternalAuth" ng-class="{required: required.preferredLanguage}">',
'        <label class="col-sm-4" for="givenName" translate>user.password</label>',
'        <a href="/console/account/passwordRecovery?email={{user.user.mail | encodeURIComponent}}"',
'          target="_blank" class="col-sm-8 password">',
'          <span translate>user.reset</span>',
'          <i class="glyphicon glyphicon-new-window"></i>',
'        </a>',
'      </div>',
'',
'      <div ng-if="platformInfos.saslEnabled">',
'        <div class="form-group form-group-sm" ng-if="model.$promise">',
'          <label class="col-sm-4" for="saslUser">',
'            <span translate>sasl.remote.user</span>',
'            {{ platformInfos.saslServer }}',
'            <span title="{{\'sasl.tooltip\' | translate}}" class="glyphicon glyphicon-info-sign"></span>',
'          </label>',
'          <div class="col-sm-8">',
'            <input id="saslUser" type="text" class="form-control" ng-model="model.saslUser">',
'          </div>',
'        </div>',
'      </div>',
'    </div>',
'  </div>',
'',
'</form>',
'',''].join("\n"));
  }]);
})();
});

require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=templates.js.map