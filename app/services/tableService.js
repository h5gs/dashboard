app.factory('tableService',
 ['$q','$http', 'utilityService', 'tableTypeService','$rootScope',
 function ($q,$http, utilityService, tableTypeService,$rootScope) {

    var global = {}; 

    global.saveTables = function(appId, tables){

        var q=$q.defer();

        var promise = [];
      
        for(var i=0;i<tables.length; i++){
          promise.push(global.saveTable(appId, tables[i]));
        }

        $q.all(promise).then(function(){
            q.resolve();
        }, function(){
            q.reject();
        });

        return  q.promise;
    };

    global.deleteTables = function(appId, tables){

        var q=$q.defer();

        var promise = [];
      
        for(var i=0;i<tables.length; i++){
            promise.push(global.deleteTable(appId, tables[i]));
        }

        $q.all(promise).then(function(){
            q.resolve();
        }, function(){
            q.reject();
        });

        return  q.promise;
    };

     global.deleteTable = function(appId, table){
        var q=$q.defer();

        $http.put(serverURL+'/table/delete/'+appId,{name : table.name}).
          success(function(data, status, headers, config) {
                q.resolve(data);

                /****Tracking*********/            
                 mixpanel.track('Delete Table', { "Table name": table.name,"appId": appId});
                /****End of Tracking*****/
          }).
          error(function(data, status, headers, config) {
                q.reject(status);
                if(status===401){
                  $rootScope.logOut();
                } 
          });
          return  q.promise;
        
    };

    global.saveTable = function(appId, table){
        var q=$q.defer();

        var tableObj = new CB.CloudTable(table.name); 

        tableObj.save()
        .then(function(obj){
          q.resolve(obj);
        }, function(err){
          q.reject(err);
        });             

        /*for(var i=0;i<table.columns.length;++i){
          var column = new CB.Column(table.columns[i].name, table.columns[i].dataType, table.columns[i].required, table.columns[i].unique);
          tableObj.addColumn(column);
        }*/        

        //serialze
        /*tableObj = {
          columns : table.columns,
          name    : table.name, 
          type    : table.type.type,
          appId   : appId,
          id      : table.id          
        };*/       

        /*$http.put(serverURL+'/table/create/'+appId,obj).
        success(function(data, status, headers, config) {
            q.resolve(data);

            /****Tracking*********/            
             //mixpanel.track('Save Table', { "Table name": table.name,"appId": appId});
            /****End of Tracking*****/
        /*}).
        error(function(data, status, headers, config) {
            q.reject(status);
            if(status===401){
              $rootScope.logOut();
            }
        });*/
        return  q.promise;
     };
     
    global.getProjectTables = function(){
        var q=$q.defer();

        CB.CloudTable.getAll()
        .then(function(tableArray){

          if(tableArray.length>0){
            var tempData = tableArray;
            data = [];
            for(var i=0;i<tempData.length;i++){
              var table = {
                _id     : tempData[i]._id,
                id      : tempData[i].id,
                name    : tempData[i].name,
                columns : tempData[i].columns,
                type    : _.first(_.where(tableTypeService.getTableTypes(), {type : tempData[i].type}))
              };

              data.push(table);
            }
          }
          q.resolve(data);

        }, function(err){
          q.reject(err);          
        });      

        return  q.promise;
      };

      global.getProjectTableByName = function(appId,Name){
        var q=$q.defer();
      
        var obj={appId:appId};

        $http.put(serverURL+'/table/'+Name,obj).
          success(function(data, status, headers, config) {
            if(data){
              var tempData = data;      
             
                var table = {
                  _id     : tempData._id,
                  id      : tempData.id,
                  name    : tempData.name,
                  columns : tempData.columns,
                  type    : _.first(_.where(tableTypeService.getTableTypes(), {type : tempData.type}))              
                };
            }
            q.resolve(table);

          }).
          error(function(data, status, headers, config) {
              q.reject(status);
              if(status===401){
                $rootScope.logOut();
              }
          });

          return  q.promise;
      }; 
    return global;

}]);
