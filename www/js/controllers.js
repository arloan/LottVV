angular.module('newsionic.controllers', ['ionic'])

.controller('NewsCtrl', function($scope, $ionicLoading, $stateParams, $http, $timeout) {
	api_v1 = {
		prefix: 'posts/',
		posts: '',
		post: '',
		categories: 'types/posts/taxonomies/category/terms',
	};
	api_v2 = {
		prefix: 'wp/v2/',
		posts: 'posts/',
		post: 'posts/',
		categories: 'categories/',
		translator: function(src_type, data) {
			if (src_type == 'posts') return this.translate_posts(data);
			if (src_type == 'post') return this.translate_post(data);
			if (src_type == 'categories') return this.translate_categories(data);
		},
		translate_post: function(post) {
			var tr_post = {
				ID: post.id,
				title: post.title.rendered,
				status: 'publish',
				type: post.type,
				author: { ID: post.author },
				content: post.content.rendered,
				link: post.link,
				date: post.date,
				modified: post.modified,
				format: post.format,
				slug: post.slug,
				guid: post.guid.rendered,
				excerpt: post.excerpt.rendered,
				menu_order: 0,
				comment_status: post.comment_status,
				ping_status: post.ping_status,
				sticky: post.sticky,
				date_gmt: post.date_gmt,
				modified_gmt: post.modified_gmt,
				meta: {
					links: {
						self: post._links.self[0].href,
						author: post._links.author[0].href,
						collection: post._links.collection[0].href,
						replies: post._links.replies[0].href,
						'version-history': post._links['version-history'][0].href,
					}
				},
				featured_image: {
					ID: post.featured_media,
					type: 'attachment',
					source:'http://localhost:9292/wp-media-v2/' + post._links['wp:featuredmedia'][0].href,
				},
			};
			return tr_post;
		},
		translate_posts: function(posts) {
			var tr_posts = [];
			for (let p of posts) {
				var post = {
					ID: p.id,
					title: p.title.rendered,
					status: 'publish',
					type: p.type,
					author: { ID: p.author, username: 'unknown', name: 'unknown' },
					content: p.content.rendered,
					link: p.link,
					date: p.date,
					modified: p.modified,
					format: p.format,
					slug: p.slug,
					guid: p.guid.rendered,
					excerpt: p.excerpt.rendered,
					menu_order: 0,
					comment_status: p.comment_status,
					ping_status: p.ping_status,
					sticky: p.sticky,
					date_tz: 'UTC',
					date_gmt: p.date_gmt,
					modified_tz: 'UTC',
					modified_gmt: p.modified_gmt,
					meta: {
						links: {
							self: p._links.self[0],
							author: p._links.author[0].href,
							collection: p._links.collection[0].href,
							replies: p._links.replies[0].href,
							'version-history': p._links['version-history'][0].href,
						}
					},
					featured_image: {
						ID: p.featured_media,
						type: 'attachment',
						source: 'http://localhost:9292/wp-media-v2/' + p._links['wp:featuredmedia'][0].href,
					},
				};
				tr_posts.push(post);
			}//for-of
			return tr_posts;
		},
		translate_categories: function(cats) {
			var tr_cats = [];
			for (let c of cats) {
				var cat = {
					ID: c.id,
					name: c.name,
					slug: c.slug,
					description: c.description,
					taxonomy: c.taxonomy,
					parent: null,
					count: c.count,
					link: c.link,
					meta: {
						links: {
							collection: c._links.collection[0].href,
							self: c._links.self[0].href,
						}
					}, // meta
				};
				tr_cats.push(cat);
			} // for-of
			return tr_cats;
		}
	};

	// Change your json API url here with http://crossorigin.me/http://yourwordpressurl/wp-json/posts
	api = api_v2;
	let cor = 'http://localhost:9292/cor/';
	let base = 'https://www.villagevoice.com/wp-json/';

	window.api_url = function(url_type, query) {
		if (query == undefined) query = null;
		return $scope.newsAPI + api.prefix + api[url_type] + (query || '');
	};

	//$scope.newsAPI = 'http://localhost:9292/cor/http://pixelmarketing.biz/news/wp-json/posts/';
	$scope.newsAPI = cor + base;
		
	$scope.show = function() {
		$ionicLoading.show({
			template: 'Loading...'
		});
	};
	
	$scope.hide = function(){
		$ionicLoading.hide();
	};
	
	$scope.categories = [];
	$scope.posts = [];
	
	
	// Scroll to Refresh
	$scope.doRefresh = function() {
		$http.get(api_url('posts')).success(function(data){
			if (api.translator) data = api.translator('posts', data);
			$scope.posts = data || [];
			$scope.$broadcast('scroll.refreshComplete');
		});
	};
	
	//Fetch the Categories list to show in Sliding Menu
	$http.get(api_url('categories')).success(function(data){
		if (api.translator) data = api.translator('categories', data);
		$scope.categories = data || [];
	});
	
	$scope.show();
	
	$scope.loadPosts = function() {
		// Fetch the Latest Posts
		$http.get(api_url('posts')).success(function(data){
			if (api.translator) data = api.translator('posts', data);
			$scope.posts = data || [];
			window.localStorage.setItem("posts", JSON.stringify(data));
			$scope.hide();
		})
		.error(function(data) {
            if(window.localStorage.getItem("posts") !== undefined) {
                $scope.posts = JSON.parse(window.localStorage.getItem("posts"));
            }
        });
	};
	
	
	
	// Load posts on page load
    $scope.loadPosts();

    paged = 2;
    $scope.moreItems = true;
	
		$scope.loadMore = function() {

      if( !$scope.moreItems ) {
        return;
      }

			var pg = paged++;

      $timeout(function() {

        $http.get(api_url('posts', '?page=' + pg)).success(function(data, status, headers, config){
					if (api.translator) data = api.translator('posts', data) || [];
          angular.forEach( data, function( value, key ) {
            $scope.posts.push(value);
          });

          if( data.length <= 0 ) {
            $scope.moreItems = false;
          }
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.resize');
				}).
        error(function(data, status, headers, config) {
          $scope.moreItems = false;
          console.log('error');
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.resize');
				});

      }, 1000);

    }

    $scope.moreDataExists = function() {
      return $scope.moreItems;
    }
	
	
})


.controller('CategoryCtrl', function($scope, $ionicLoading, $stateParams, $http, $timeout) {
	
	var filter = '?filter[category_name]='+$stateParams.catSlug;
	if (api == api_v2) filter = '?categories=' + $stateParams.catSlug;

	$scope.doRefresh = function() {
		$http.get(api_url('posts', filter)).success(function(data){
			if (api.translator) data = api.translator('posts', data) || [];
			$scope.catPosts = data;
			$scope.$broadcast('scroll.refreshComplete');
		});
	};
	
	$scope.catPosts = [];
	$scope.category = null;
	for (let c of $scope.categories) {
		if (c.ID == $stateParams.catSlug) {
			$scope.category = c;
			break;
		}
	}
	
	$scope.show();
	
	$http.get(api_url('posts', filter)).success(function(data){
		if (api.translator) data = api.translator('posts', data) || [];
		$scope.catPosts = data;
		$scope.hide();
	});
	
	paged = 2;
	$scope.moreItems = true;

	$scope.loadMore = function() {

		if( !$scope.moreItems ) {
			return;
		}

		var pg = paged++;

		$timeout(function() {

			// var cf = '?filter[category_name]=' + $stateParams.catSlug;
			// if (api == api_v2) cf = '?categories=' + $stateParams.catSlug;
			$http.get(api_url('posts', filter + '&page=' + pg)).success(function(data, status, headers, config){
				if (api.translator) data = api.translator('posts', data) || [];
				angular.forEach( data, function( value, key ) {
					$scope.catPosts.push(value);
				});

				if( data.length <= 0 ) {
					$scope.moreItems = false;
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.$broadcast('scroll.resize');
			}).
			error(function(data, status, headers, config) {
				$scope.moreItems = false;
				console.log('error');
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.$broadcast('scroll.resize');
			});

		}, 1000);

	}
})

.controller('PostCtrl', function($scope, $stateParams, $sce, $ionicLoading, $http ) {

	
	$scope.post = [];

	$scope.show();

	$http.get(api_url('post', $stateParams.postId)).success(function(data){
		if (api.translator) data = api.translator('post', data) || [];
		$scope.post = data;

		$scope.hide();
	});
 
})
