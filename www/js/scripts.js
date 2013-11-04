var app = {
	
	baseUrl: "http://dev-conquer.gotpantheon.com",
	baseUrlNoProtocol: "/",
	appServiceUrl: "/mobileapp",
	content: null,

    // Application Constructor
    initialize: function() {
        app.bindEvents();
    },
	
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
		app.getMainMenu();
		app.content = $("#main-content");
		app.goto();
    },
	
	goto: function(path){
		console.log("going to: " + path);
		var newContent = '';
		app.clearMainContent();
		if(!path || path == '<front>'){
			newContent = app.getFrontPage();
		}
		else if(/node\/[0-9]*$/.test(path)){
			newContent = app.getNode(path);
		}
		else if(path){
			newContent = app.getPath(path);
		}
		
		app.setMainContent(newContent);
	},
	
	getMainMenu: function(){
		var menuUrl = app.baseUrl + app.appServiceUrl + "/mainmenu";
		
		$.getJSON(menuUrl, null, function(data){
			var mainMenuMarkup = app.getMenuMarkup(data, "mainMenu");
			console.log(mainMenuMarkup);
			$(".mainMenu-wrapper").append(mainMenuMarkup);
			app.mainMenu = $(".mainMenu");
		});
	},
	
	getMenuMarkup: function(menuData, menuClass){
		var menuMarkup = "<ul class='" + menuClass + "'>";
		$.each(menuData, function(i, menuItem){
			var item = menuItem.link;
			
			var item_html = "<li class='" + menuClass + "Item menuItem'>"
			item_html += "<a onclick='app.goto(\"" + item.href + "\")'>" + item.link_title + "</a>"; 
			
			if(item.has_children == 1){
				item_html += app.getMenuMarkup(menuItem.below, menuClass+"Sub");
			}
			
			item_html += "</li>";
			menuMarkup += item_html;
		});
		menuMarkup += "</ul>";
		return menuMarkup;
	},
	
	getBlock: function(module, delta){
		var blockUrl = app.baseUrl + app.appServiceUrl + "/block?module_name=" + module + "&delta=" + delta;
		var blockMarkup = "<div class='block block-" + module + "-" + delta + "'>";
		$.getJSON(blockUrl, null, function(data){
			var blockContentMarkup = "<h2 class='block-title'>" + data.title + "</h2>";
			blockContentMarkup += "<div class='block-content'>" + data.content + "</div>";
			$(".block-" + module + "-" + delta).append(blockContentMarkup);
		});
		blockMarkup += "</div>";
		return blockMarkup;
	},
	
	getNode: function(nodePath){
		if(/node\/[0-9]*$/.test(nodePath)){
			
			var nodeUrl = app.baseUrl + app.appServiceUrl + "/" + nodePath;
			console.log("loading node:" + nodeUrl);
			var nodeClass = nodePath.replace("/", "-");
			var nodeMarkup = "<div class='node " + nodeClass + "'></div>";
			$.getJSON(nodeUrl, null, function(data){
				
				var nodeContentMarkup = "<h1 class='node-title'>" + data.title + "</h1>";
				nodeContentMarkup += "<div class='node-content'>" + data.body.und[0].safe_value + "</div>";
				$("."+nodeClass).html(nodeContentMarkup);
			});
			return nodeMarkup;
		}
		else{
			
		}
	},
	
	getPath: function(alias){
		var pathUrl = app.baseUrl + app.appServiceUrl + "/path/" + alias;
		console.log(pathUrl);
		var pathClass = alias.replace("/", "-");
		var pathMarkup = "<div class='path path-" + pathClass + "'></div>";
		$.getJSON(pathUrl, null, function(data){
			console.log($(data).find("#block-system-main").html());
			$(".path-"+pathClass)
				.html($(data).find("#block-system-main").html())
				.find("a").each(function(index, element) {
                    var a_href = $(element).attr("href");
					console.log(a_href);
					a_href = a_href.replace("http://", "");
					a_href = a_href.replace(app.baseUrlNoProtocol, "");
					
					$(element).removeAttr("href");
					$(element).attr("onclick", "app.goto('" + a_href + "');");
                });;
		});
		return pathMarkup;
	},
	
	
	setMainContent: function(content){
		app.content.html(content);
	},
	
	clearMainContent: function(){
		app.setMainContent("");
	},
	
	getFrontPage: function(){
		return app.getBlock("block", 1);
	}
};