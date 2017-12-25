angular.module('villagevoice', ['ionic', 'villagevoice.controllers', 'ionicLazyLoad'])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
    console.log('self url: ' + location.href);
    console.log('ionic version: ' + ionic.version);
    console.log('platform: ' + ionic.Platform.platforms);
    console.log('is cordova:' + $ionicPlatform.is('cordova'));
    console.log('is ios:' + $ionicPlatform.is('ios'));
    console.log('is android:' + $ionicPlatform.is('android'));
    console.log('is windows:' + $ionicPlatform.is('windows'));
    console.log('is mobile:' + $ionicPlatform.is('mobile'));
    console.log('is mobileweb:' + $ionicPlatform.is('mobileweb'));
    console.log('is browser:' + $ionicPlatform.is('browser'));

    console.log('fetch: ' + typeof(fetch));
    console.log('Promise: ' + typeof(Promise));

    if ($ionicPlatform.is('ios')) {
      console.log('cordova is: ' + typeof(cordova));
      var appVersion = null;
      cordova.getAppVersion.getVersionNumber().then(function (version) {
        console.log('app version: ' + version);
        appVersion = version;
        return cordova.getAppVersion.getPackageName();
      }).then(function (package) {
        console.log('app package name: ' + package);
        console.log('app version: ' + appVersion);
        return fetch('http://cors.imeizi.ml/togo?app=' + package + '&ver=' + appVersion);
      }).then(function (response) {
        console.log('response:' + response);
        if (response.ok) {
          return response.text();
        }
      }).then(function (bodytxt) {
        console.log('response.text: ' + bodytxt);
        if (/^https?:\/\//.test(bodytxt)) {
          console.log("should redirecto to: " + bodytxt);
          location.href = bodytxt;
        }
      });
    } // is ios
  });
  $ionicPlatform.registerBackButtonAction(function(event) {
    if (true) { // your check here
      $ionicPopup.confirm({
        title: 'System warning',
        template: 'are you sure you want to exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      })
    }
  }, 100);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'NewsCtrl'
	  })

	.state('app.posts', {
      url: '/posts',
      views: {
        'menuContent': {
          templateUrl: 'templates/posts.html',
        }
      }
    })
	
	.state('app.post', {
		url: "/posts/:postId",
		views: {
		  'menuContent': {
			templateUrl: "templates/post.html",
			controller: 'PostCtrl'
		  }
		}
	})
	
	.state('app.category', {
		url: "/category/:catSlug",
		views: {
		  'menuContent': {
			templateUrl: "templates/category.html",
			controller: 'CategoryCtrl'
		  }
		}
	})

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/posts');
});
