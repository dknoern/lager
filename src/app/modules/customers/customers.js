(function() {
  'use strict';

  angular.module('singApp.customers')
    .controller('CustomersCtrl', CustomersCtrl)
  ;

  CustomersCtrl.$inject = ['$scope', '$resource', 'DTOptionsBuilder', '$http', 'jQuery'];
  function CustomersCtrl ($scope, $resource, DTOptionsBuilder, $http, jQuery) {
    jQuery.extend( jQuery.fn.dataTableExt.oPagination, {
      "bootstrap": {
        "fnInit": function( oSettings, nPaging, fnDraw ) {
          var oLang = oSettings.oLanguage.oPaginate;
          var fnClickHandler = function ( e ) {
            e.preventDefault();
            if ( oSettings.oApi._fnPageChange(oSettings, e.data.action) ) {
              fnDraw( oSettings );
            }
          };

          jQuery(nPaging).append(
            '<ul class="pagination no-margin">'+
            '<li class="prev disabled"><a href="#">'+oLang.sPrevious+'</a></li>'+
            '<li class="next disabled"><a href="#">'+oLang.sNext+'</a></li>'+
            '</ul>'
          );
          var els = jQuery('a', nPaging);
          jQuery(els[0]).bind( 'click.DT', { action: 'previous' }, fnClickHandler );
          jQuery(els[1]).bind( 'click.DT', { action: 'next' }, fnClickHandler );
        },

        "fnUpdate": function ( oSettings, fnDraw ) {
          var iListLength = 5;
          var oPaging = oSettings.oInstance.fnPagingInfo();
          var an = oSettings.aanFeatures.p;
          var i, ien, j, sClass, iStart, iEnd, iHalf=Math.floor(iListLength/2);

          if ( oPaging.iTotalPages < iListLength) {
            iStart = 1;
            iEnd = oPaging.iTotalPages;
          }
          else if ( oPaging.iPage <= iHalf ) {
            iStart = 1;
            iEnd = iListLength;
          } else if ( oPaging.iPage >= (oPaging.iTotalPages-iHalf) ) {
            iStart = oPaging.iTotalPages - iListLength + 1;
            iEnd = oPaging.iTotalPages;
          } else {
            iStart = oPaging.iPage - iHalf + 1;
            iEnd = iStart + iListLength - 1;
          }

          function bind (e) {
            e.preventDefault();
            oSettings._iDisplayStart = (parseInt(jQuery('a', this).text(),10)-1) * oPaging.iLength;
            fnDraw( oSettings );
          }

          for ( i=0, ien=an.length ; i<ien ; i++ ) {
            // Remove the middle elements
            jQuery('li:gt(0)', an[i]).filter(':not(:last)').remove();

            // Add the new list items and their event handlers
            for ( j=iStart ; j<=iEnd ; j++ ) {
              sClass = (j===oPaging.iPage+1) ? 'class="active"' : '';
              jQuery('<li '+sClass+'><a href="#">'+j+'</a></li>')
                .insertBefore( jQuery('li:last', an[i])[0] )
                .bind('click', bind );
            }

            // Add / remove disabled classes from the static elements
            if ( oPaging.iPage === 0 ) {
              jQuery('li:first', an[i]).addClass('disabled');
            } else {
              jQuery('li:first', an[i]).removeClass('disabled');
            }

            if ( oPaging.iPage === oPaging.iTotalPages-1 || oPaging.iTotalPages === 0 ) {
              jQuery('li:last', an[i]).addClass('disabled');
            } else {
              jQuery('li:last', an[i]).removeClass('disabled');
            }
          }
        }
      }
    } );

    var accessToken = localStorage.getItem('access_token');

    var table = jQuery('#example').DataTable({
      "processing": true,
      "serverSide": true,
      "ordering": false,
      stateSave: true,
      "ajax": {
        url: "/api/customers",
        headers: {
          "Authorization": "Bearer " + accessToken
        }
      }
    }
    );

    $scope.mergeCustomers = function () {

      console.log("merging");

      var postData = {
        "ids": customerIds
      }

      $http.post('api/customers/merge', postData).then(function successCallback(response) {
        console.log(response.statusText);
        table.ajax.reload();

        Messenger().post({
          message: "Customers merged.",
          type: "success"
        });
      }, function errorCallback(response) {
        console.log(response.statusText);
      });
    }
  }
})();
