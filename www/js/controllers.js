 angular.module('starter.controllers', [])

.factory("Clientes", function($firebaseArray) {
  var clientesRef = new Firebase("https://clientesmaquila.firebaseio.com/clientes");
  return $firebaseArray(clientesRef);
})
.factory("Usuarios", function($firebaseArray) {
  var usuariosRef = new Firebase("https://clientesmaquila.firebaseio.com/usuarios");
  return $firebaseArray(usuariosRef);
})
.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, $ionicHistory, $ionicPopup, Clientes, Usuarios, $state) {

  $ionicHistory.clearHistory();
      
  // Data Arrays]
  $scope.addClienteData = {};
  $scope.clientes = Clientes;
  $scope.usuarios = Usuarios;
  var output = [];

  var ref = new Firebase("https://clientesmaquila.firebaseio.com");
  var authData = ref.getAuth();
  
  if (authData) {
      
      //console.log(authData);
      var usuario = new Firebase("https://clientesmaquila.firebaseio.com/usuarios");

      usuario.orderByChild("uid").equalTo(authData.uid).on("child_added", function(snapshot) {
        
        var data = snapshot.val();


        $scope.UserFullName = data.nombre;
        $scope.UserEmail = data.email;
        $scope.UserUid = data.uid;
        $scope.UserAvatar = authData.password.profileImageURL;
      
      }, function (errorObject) {
        
        console.log("The read failed: " + errorObject);
      
      });

    $scope.filterSecId = function(items) {
        var result = {};
        angular.forEach(items, function(value, key) {
            if (!value.hasOwnProperty('secId')) {
                result[key] = value;
            }
        });
        return result;
    }
    var clientesde = new Firebase("https://clientesmaquila.firebaseio.com/clientes");

      clientesde.orderByChild("usuario").equalTo(authData.uid).on("value", function(resultados) {

        var datalista = resultados.val();
        $scope.clienteslist = datalista;

      
      }, function (errorObject) {
        
        console.log("The read failed: " + errorObject.code);
      
      });
    
    $location.path('/app/clientes'); 
  
  } else {
    
    $location.path('/login');
    console.log("User is logged out");
    //$state.go("login");
  }

  //Modal agregar cliente
  $ionicModal.fromTemplateUrl('templates/agregarcliente.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modaladdcliente = modal;
  });


  // Open the agregar cliente
  $scope.agregarCliente = function() {
    $scope.modaladdcliente.show();
  }; 


  //Cerrar Agregar Cliente
  $scope.cerrarCliente = function() {
    $scope.modaladdcliente.hide();
  };


  //Cerrar Sesión de Usuario
  $scope.logOutUser = function() {

    //console.log(authData);

    if (authData){

      ref.unauth();
      $scope.clienteslist = null; 
      $location.path('/login');


    } else {

      console.log("User is not logged");

    }

  };


  //Guardamos Clientes
  $scope.guardarCliente = function() {

    var ref = new Firebase("https://clientesmaquila.firebaseio.com");
    var authData = ref.getAuth();
    if (authData) {

      $scope.clientes.$add({

        "name": $scope.addClienteData.nombre,
        "empresa": $scope.addClienteData.empresa,
        "email": $scope.addClienteData.email,
        "usuario": authData.uid,
        "id": Firebase.ServerValue.TIMESTAMP

      });

      $ionicPopup.alert({
           title: '¡Cliente Guardado!',
           template: "Se ha añadido "+ $scope.addClienteData.nombre +"."
      });

      $scope.cerrarCliente();

    } else {

      $ionicPopup.alert({
           title: 'Tenemos un Error :(',
           template: "Por favor cierra sesión y vuelve a intentarlo, si el problema persiste, contáctenos."
      });

      $scope.cerrarCliente();

    }

  };
 
})

.controller('Login', function($scope, $ionicModal, $timeout, $location, $ionicPopup, Usuarios) {
  
  $scope.loginData = {};
  $scope.UserEmail = null;
  $scope.NombreCompleto = null;
  $scope.regData = {};
  $scope.clienteslist = null; 
  $scope.usuarios = Usuarios;
  
  //Modal para registrarse
  $ionicModal.fromTemplateUrl('templates/registration.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modalreg = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeRegistration = function() {
    $scope.modalreg.hide();
  };

  // Open the login modal
  $scope.registrarse = function() {
    $scope.modalreg.show();
  };



  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    //console.log('Doing login', $scope.loginData);

    // console.log($scope.loginData.username);
    // console.log($scope.loginData.password);

    var ref = new Firebase("https://clientesmaquila.firebaseio.com");
      ref.authWithPassword({
        email    : $scope.loginData.username,
        password : $scope.loginData.password
      }, function(error, authData) {
        if (error) {
          $ionicPopup.alert({
           title: 'Tenemos un Error :(',
           template: error
         });
        } else {
          $ionicPopup.alert({
           title: 'Welcome!',
           template: 'Bienvenid@ de regreso! :)'
         });
        $scope.loginData.username = null
        $scope.loginData.password = null
        $location.path('/app/clientes');
        }
      });
    //window.location = "#/app";

    // $scope.closeLogin();

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    // $timeout(function() {
    //   $scope.closeLogin();
    // }, 1000);
  };

  //Registro de Usuarios
  $scope.doRegistrarse = function() {

    var ref = new Firebase("https://clientesmaquila.firebaseio.com");
    ref.createUser({
      email    : $scope.regData.email,
      password : $scope.regData.password
    }, function(error, userData) {
      if (error) {
         $ionicPopup.alert({
           title: 'Tenemos un Error :(',
           template: error
         });
    
      } else {
        $scope.usuarios.$add({
          "nombre":   $scope.regData.nombre,
          "email":    $scope.regData.email,
          "uid":      userData.uid
        });
        $ionicPopup.alert({
           title: 'Welcome!',
           template: 'Te has registrado correctamente :)'
         });
        $scope.closeRegistration();


        ref.authWithPassword({

        email    : $scope.regData.email,
        password : $scope.regData.password

          }, function(error, authData) {
          
          if (error) {
            
            $ionicPopup.alert({
             title: 'Tenemos un Error a logearte, intenta de nuevo :(',
             template: error
           });        

          } else {

            $location.path('/app/clientes');
        
          }
        
        });

      }
    });
   
  };

})



 /*

  COMIENZA CLIENTE
 */


.controller('clientecontroller', function($scope, $state, $ionicModal, $ionicPopup) {

  $scope.addDataData = {};
  $scope.editDataData = {};

  //Modal Agregar Dato
  $ionicModal.fromTemplateUrl('templates/agregardata.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modaladddato = modal;
  });

  //Modal Editar Dato
  $ionicModal.fromTemplateUrl('templates/editardata.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modaleditdato = modal;
  });

   // Open Agregar Dato
  $scope.agregarDato = function() {
    $scope.modaladddato.show();
  }; 

  //Cerrar Agregar Dato
  $scope.cerrarDato = function() {
    $scope.modaladddato.hide();
  };

   // Open Editar Dato
  $scope.abrirDato = function() {
    $scope.modaleditdato.show();
  }; 

  //Cerrar Editar Dato
  $scope.cerrarEditarDato = function() {
    $scope.modaleditdato.hide();
  };

  $scope.filterSecId = function(items) {
        var result = {};
        angular.forEach(items, function(value, key) {
            if (!value.hasOwnProperty('secId')) {
                result[key] = value;
            }
        });
        return result;
  }

  var clientenumber = $state.params.aId;
  //console.log(clientenumber);
  $scope.clienteespecificoaid = clientenumber;
  //console.log($scope.clienteespecificoaid);
  var cliente = new Firebase("https://clientesmaquila.firebaseio.com/clientes/" + clientenumber);
  cliente.on("value", function(snap) {

    $scope.clienteespecifico = snap.val();
    //console.log($scope.clienteespecifico);
 
  });

  //Guardamos Data
  $scope.guardarData = function() {

    var ref = new Firebase("https://clientesmaquila.firebaseio.com/clientes/"+ clientenumber +"/");

      proyectos = ref.child("proyectos");

      proyectos.push({

        "proyecto": $scope.addDataData.proyecto,
        "costo": $scope.addDataData.costo,
        "description": $scope.addDataData.descripcion,
        "activo": "true",
        "timestamp": Firebase.ServerValue.TIMESTAMP

      });

      $ionicPopup.alert({
           title: '¡Proyecto Guardado!',
           template: "Se ha añadido: "+ $scope.addDataData.proyecto +"."
      });
      $scope.addDataData.proyecto = null;
      $scope.addDataData.costo = null;
      $scope.addDataData.descripcion = null;
      $scope.cerrarDato();

  };

  //Mover Proyecto a terminado
  $scope.proyectoTerminado = function(id, clienteespecificoaid) {

      var ref = new Firebase("https://clientesmaquila.firebaseio.com/clientes/"+ clienteespecificoaid +"/proyectos/"+ id);

      ref.update({
        "activo": "false"
      });

      // $ionicPopup.alert({
      //      title: 'Proyecto Actualizado' });

      //console.log(id + " \ " + clienteespecificoaid);

  };

  //Mover Proyecto a Activo
  $scope.proyectoActivo = function(id, clienteespecificoaid) {

    var ref = new Firebase("https://clientesmaquila.firebaseio.com/clientes/"+ clienteespecificoaid +"/proyectos/"+ id);

      ref.update({
        "activo": "true"
      });

      // $ionicPopup.alert({
      //      title: 'Proyecto Actualizado' });

  };

  //Editar Proyecto
  $scope.editarProyecto = function(id, clienteespecificoaid, item) {

    $scope.editDataData.proyecto = item.proyecto;
    $scope.editDataData.costo = item.costo;
    $scope.editDataData.descripcion = item.description;
    $scope.editDataData.idproyecto = id;
    $scope.editDataData.clienteespecificoaid = clienteespecificoaid;
    $scope.abrirDato();

  };

  // Guardar nuevos datos editados
  $scope.EditarData = function(){


    var ref = new Firebase("https://clientesmaquila.firebaseio.com/clientes/"+ $scope.editDataData.clienteespecificoaid +"/proyectos/"+ $scope.editDataData.idproyecto);

      ref.update({
        "proyecto": $scope.editDataData.proyecto,
        "costo": $scope.editDataData.costo,
        "description": $scope.editDataData.descripcion
      });

      $ionicPopup.alert({
           title: 'Proyecto Actualizado' }).then(function(){
            $scope.cerrarEditarDato();
      });

  };

  //Eliminar Proyecto
  $scope.eliminarProyecto = function(id, clienteespecificoaid) {

    var ref = new Firebase("https://clientesmaquila.firebaseio.com/clientes/"+ clienteespecificoaid +"/proyectos/"+ id);

     var confirmPopup = $ionicPopup.confirm({
     title: 'Borrar Proyecto',
     template: '¿Está seguro que desea eliminar este proyecto?'
      });
     confirmPopup.then(function(res) {
       if(res) {
         var onComplete = function(error) {
        if (error) {

          $ionicPopup.alert({
          title: 'Error',
          template: error
           });

        } else {

          $ionicPopup.alert({
          title: 'Proyecto Eliminado' });

        }
      };

      ref.remove(onComplete);
       } else {
         console.log('Proyecto no borrado');
       }
     });

  };

});
