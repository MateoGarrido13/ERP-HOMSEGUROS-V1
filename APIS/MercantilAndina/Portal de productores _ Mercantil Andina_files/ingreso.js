/*!
  * SigMa v3, ingreso.js v1
  * Mercantil andina Seguros
  * Funciones de uso exclusivo en la página de ingreso de credenciales de usuario.
  */
$(document).ready(function(){

$("#boton-esconder-cont-error").on("click", function(event){
	esconderContenedorError();
})
	$("#form-ingreso").on( "submit",  function(event){
		event.preventDefault();
			//Inicializa variables
		var error = "";
		var resp = {};
		var resultado = false;
		//Muestra "progreso"
		$("#form-ingreso input").attr("disabled", "disabled");
		$("#form-ingreso button").attr("disabled", "disabled");
		$("#acceder").html("<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Ingresando...");
		//Arma el elemento
		var usuario = $("#usuario").val();
		//var captchaToken = $("#recaptchaResponse").val();
		var captchaToken = '';
		var elemento = {
			"usuario": usuario,
			"contrasena": $("#contrasena").val(),
			"captchaToken": captchaToken
		};
		callCaptcha(elemento);
	});

	function callCaptcha(elemento){
		grecaptcha.ready(function() {
			grecaptcha.execute(reCAPTCHA_site_key, {action: 'login'}).then(function(token) {
				elemento.captchaToken = token;
				// Add your logic to submit to your backend server here.
				//Realiza la llamada al servicio
				$.ajax({
					url: "conectar",
					type: "POST",
					data: elemento,
					headers: {
						"accept": "application/json;odata=verbose"
					},
					success: function (data) {
						error = '';
						if(data)
							error = data.error;
						//Analiza la respuesta y si hubo o no error
						if (error.length > 0){
							mostrarContenedorError();
							$("#msj-error").html(error);
							$("#form-ingreso input").removeAttr("disabled");
							$("#form-ingreso button").removeAttr("disabled");
							$("#acceder").html("Iniciar sesi&oacute;n");
						} else if (data.caduco == "1") {
							location = "cambiarclave?token=" + data.token + "&u=" +  elemento.usuario.toUpperCase();
						} else {
							window.dataLayer = window.dataLayer || [];
							window.dataLayer.push({
								'event': 'Login_Sigma_OK', 
								'event_label': 'login-sigma',
								'method': 'sigma_portal',
							});
							sessionStorage.setItem('just_logged_in', '1');
							location = urlBaseContenido;
						}
					},
					error: function (request, status, error) {
						
						mostrarContenedorError();
						if(request.responseJSON){
							$("#msj-error").html(request.responseJSON.error);
						}else{
							$("#msj-error").html("Ha ocurrido un problema al validar los datos.");
						}
						
						$("#form-ingreso input").removeAttr("disabled");
						$("#form-ingreso button").removeAttr("disabled");
						$("#acceder").html("Iniciar sesi&oacute;n");

					}
				});
			}).catch(function(error) {
				//manejo de error en caso de que el usuario cancele el challenge del captcha
				mostrarContenedorError();
				$("#msj-error").html("reCaptcha invalido. Vuelva a intentar");
				$("#form-ingreso input").removeAttr("disabled");
				$("#form-ingreso button").removeAttr("disabled");
				$("#acceder").html("Iniciar sesi&oacute;n");
			});
		});
	}

var esconderContenedorError = function() {
	$("#error").removeClass("cont-msj-error-mostrar");
	$("#error").addClass("cont-msj-error-ocultar");
	setTimeout(function(){
		$("#cont-error").hide();
	}, 450);
}

var mostrarContenedorError = function() {
	$("#error").removeClass("cont-msj-error-ocultar");
	$("#error").addClass("cont-msj-error-mostrar");
	$("#cont-error").show();
}

});
