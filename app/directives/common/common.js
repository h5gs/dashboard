
app.directive('fixedtableheadcol', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).freezeHeader({ 'height': '300px' });
        }
    };
});

app.directive('fixedthead', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            var $table = $(element);
            $table.floatThead({
                scrollContainer: function($table){
                    return $table.closest('.data-table-design');
                },
                zIndex:8,
                useAbsolutePositioning:false
            });
        }
    };
});

app.directive('appIdValidation', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).keyup(function(){
               
              var error=appIdValidation(scope.newApp.appId);
              if(error){
                $(element)[0].setCustomValidity(error);
              }else{
                $(element)[0].setCustomValidity("");
              }                
                                
            });
        }
    };
});

app.directive('tooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            $(element).hover(function(){            
                // on mouseenter
                $(element).tooltip('show');
            }, function(){
                // on mouseleave
                $(element).tooltip('hide');
            });
        }
    };
});

app.directive('infotooltipleft', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)
            .attr('title',scope.$eval(attrs.infotooltipleft))
            .tooltipster({
               arrow:false,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-shadow',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});

app.directive('infotooltipright', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)  
            .attr('title',scope.$eval(attrs.infotooltipright))          
            .tooltipster({
               arrow:false,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-light',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});

app.directive('errortooltip', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element)
            .attr('title',scope.$eval(attrs.errortooltip))
            .tooltipster({
               arrow:false,
               animation: 'fade',
               delay: 200,
               theme: 'tooltipster-light',
               touchDevices: false,
               trigger: 'hover',
               position:'left'
            });
        }
    };
});

app.directive('colresize', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).resizableColumns();
        }
    };
});


//Scrollbar for both vertical and horizontal
app.directive('malihuscrollbar', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).mCustomScrollbar({
                axis:"yx",               
                advanced:{autoExpandHorizontalScroll:true,
                    updateOnContentResize: true},
                scrollbarPosition:"outside",
                theme:"dark-thick",
                scrollButtons:{enable:true,
                    scrollAmount: 20,
                    scrollType: "stepless"
                },callbacks:{
                  onTotalScroll: function(){
                    var pos=$(".smoothTable").scrollTop();
                    //console.log("Hey buddy I got totally scrolled: "+pos);
                    scope.addMoreRecords();
                  }
                }
            });           
        }
    };
});

//A mini Scrollbar for both vertical and horizontal
app.directive('malihuscrollbarForPopup', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).mCustomScrollbar({
                axis:"y",               
                advanced:{autoExpandHorizontalScroll:true},
                scrollbarPosition:"outside",
                theme:"minimal-dark"
            });
        }
    };
});

app.directive('filechange', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){       
            $(element).change(function(){
                var fileUploadControl = $(element)[0];
                if(fileUploadControl && fileUploadControl.files.length > 0) {
                    //console.log(fileUploadControl.files[0]);
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.fileSelected(reader.result,fileUploadControl.files[0].name,fileUploadControl.files[0]);
                    }
                    reader.readAsDataURL(fileUploadControl.files[0]);                    
                }
            });
        }
    };
});

app.directive('dmuploader', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){        
            $(element).dmUploader({               
                onNewFile: function(id, file){                 
                    
                    var reader = new FileReader();
                    reader.onload = function (e) {                       
                        scope.fileSelected(reader.result,file.name,file);
                    }
                    reader.readAsDataURL(file);
                    
                }
            });
        }
    };
});

app.directive('autokomplete', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
                    
            $(element).autocomplete({
                source:  function (request, response) {
                    var arrayRecords=[];                    

                    scope.queryTableByName("User")
                    .then(function(userRecords){ 

                        scope.queryTableByName("Role")
                        .then(function(roleRecords){ 
                            
                            for(var i=0;i<userRecords.length;i++){
                                arrayRecords.push(CB.toJSON( userRecords[i] ));
                            }  
                            for(var j=0;j<roleRecords.length;j++){
                                arrayRecords.push(CB.toJSON( roleRecords[j] ));
                            }               

                           //data :: JSON list defined
                            response($.map(arrayRecords, function (value, key) {                                                            
                                var details= {
                                    label   : value._id+" ("+value._tableName+")",
                                    value   : value._id,                                   
                                    player  : value._tableName
                                };
                                if(value._tableName=="User"){
                                    details.name=value.username;
                                }
                                if(value._tableName=="Role"){
                                    details.name=value.name;
                                }
                                return details;
                            }));
                        });                       
                    }); 
                  
                },
                select: function (event, ui) {
                    scope.addACL.id=ui.item.value;
                    scope.addACL.name=ui.item.name;
                    scope.addACL.player=ui.item.player; 
                    $("#acl-search-id").val(null);                                   
                }
            });
        }
    };
});


function appIdValidation(appId){
    var appIdValidationError=null;
    var response=true;
    //LowerCase
    if((appId) && (appId!= appId.toLowerCase())){
      response=false;
      appIdValidationError="App Id must be in lowercase.";                             
    }

    //Shouldn't Start with number
    if((appId) && (!isNaN(appId[0]))){
      response=false;
      appIdValidationError="App Id Shouldn't start with number.";
         
    } 

    //No Special characters
    var pattern = new RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/);
    if((appId) && (pattern.test(appId))){
      response=false;
      appIdValidationError="App Id shoudn't contain special characters";         
    }                 

    return appIdValidationError;
}


    






