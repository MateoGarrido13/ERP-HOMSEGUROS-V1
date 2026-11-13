/* Uso compartido */
function reemplazarTexto(etiqueta, busqueda, reemplazo){
	$(etiqueta).html(function(buscayreemplaza, reemplaza) {
		return reemplaza.replace(busqueda, reemplazo);
	});
}

function actualizarCajaDeTexto(origen,destino,caracteresRestantes){	
	var texto = document.getElementById(origen).value;	
	while (texto.indexOf("\n") != -1){
		texto = texto.replace("\n","<br>");
	}
	var restantes = document.getElementById(caracteresRestantes);
	var desde = 0;
	var hasta = 0;
	var lineas = document.getElementById(destino).getElementsByTagName("input");
	var cantidad = lineas.length;
	for (var i=0; i<cantidad; i++){
		desde = hasta;
		hasta = desde + parseInt(lineas.item(i).attributes.maxlength.value);
		lineas.item(i).value = texto.substring(desde,hasta);
	}
	document.getElementById(origen).attributes.maxlength.value = hasta;	
	restantes.removeChild(restantes.firstChild);
	restantes.appendChild(document.createTextNode("Caracteres restantes: " + parseInt(hasta-texto.length)));
}

function asignarFuncion(id_componente,evento,funcion,parametros){
	var funcionAAsignar = funcion + "(" + parametros + ");";
	$("#" + id_componente).attr(evento,funcionAAsignar + $("#" + id_componente).attr(evento));
}

function mostrarUOcultar(div){
	$("#" + div).slideToggle("fast");
}
function mostrar(div){
	$("#" + div).slideDown("fast");
}
function ocultar(div){
	$("#" + div).fadeOut("fast");
}
function mostrarGrupo(clase){
	$("." + clase).slideDown("fast");
}
function ocultarGrupo(clase){
	$("." + clase).fadeOut("fast");
}
function ocultarYMostrarSolo(div,clase){
	$("." + clase).hide();
	if (div.length > 0){
		$("#" + div).fadeIn("fast");
	}
}
function fadeIO(div,accion){
	//accion: 0 = ocultar, 1 = mostrar	
	switch(accion) {
    case 0:
    	$("#" + div).fadeOut("fast");
        break;
    case 1:
        $("#" + div).fadeIn("fast");
        break;
    case 3:
    	$("#" + div).fadeToggle("fast");
    	break;
	}	
}

function em_marcarOpcionImage(enlace){
	var id = "HATS" + enlace.id;
	if (document.getElementById(id).checked){
		document.getElementById(id).checked=0;
		setCheckboxValue(document.getElementById(id));
		enlace.className = "emActualizarCheckbox";		
	} else {
		document.getElementById(id).checked=1;
		enlace.className = "emActualizarCheckbox emSeleccionado";
		setCheckboxValue(document.getElementById(id));
	}	
}

function em_marcarOpcionImageUnica(enlace){
	var id = "HATS" + enlace.id;
	document.getElementById(id).checked=1;
	//Actualiza la imagen seleccionada
	var checkboxes = $('.emActualizarCheckbox');
	for (i = 0; i < checkboxes.length; i++){
		if (document.getElementById("HATS" + checkboxes[i].id).checked){
			checkboxes[i].className = "emActualizarCheckbox emSeleccionado";
		} else {
			checkboxes[i].className = "emActualizarCheckbox";
		}
	}
}

function em_marcarOpcionAlCargar(){
	//Checkboxes
	var checkboxes = $('.emActualizarCheckbox');
	for (i = 0; i < checkboxes.length; i++){
		if (document.getElementById("HATS" + checkboxes[i].id).checked){
			checkboxes[i].className = "emActualizarCheckbox emSeleccionado";
		}
	}
}

function em_enfocarYTecla(nombre,tecla){
	var destino = $('input[name=' + nombre + ']');
	destino.focus();
	//Compatibilidad con IE
	setTimeout(
			function(){
				ms('[' + tecla + ']','hatsportletid');
			}, 10);
}

function borrarNbspDeTablas(){
	$("td").each(function() {
		var $this = $(this);
		$this.html($this.html().replace(/&nbsp;/g, ' '));
	});
	$("th").each(function() {
		var $this = $(this);
		$this.html($this.html().replace(/&nbsp;/g, ' '));
	});
}

function deshabilitarAutocompletarTodos(){
	var componente = $('input');
	$(componente).attr("autocomplete","off");
}

/* Validar ACEPTAR */

function validarCheckboxAntesDeTecla(id_validar,accion){
	if ($("#" + id_validar).prop("checked")){
		ms(accion,'HATSForm');
	} else {
		alert("Ten\u00e9s que aceptar los T\u00e9rminos y Condiciones para poder continuar.");
	}
}

/* Distribución digital */
function distribucionDigitalListaDeNotificaciones(){
	var inicio = "<span style='font-weight:bold;color:";
	var medio = "'>";
	var fin = "</span>";
	reemplazarTexto("td","PENDIENTE",inicio + "orange" + medio + "PENDIENTE" + fin);
	reemplazarTexto("td","ACTIVA",inicio + "green" + medio + "ACTIVA" + fin);
	reemplazarTexto("td","ACTIVO",inicio + "green" + medio + "ACTIVO" + fin);
	reemplazarTexto("td","RECHAZADA",inicio + "red" + medio + "RECHAZADA" + fin);
	reemplazarTexto("td","RECHAZADO",inicio + "red" + medio + "RECHAZADO" + fin);
	reemplazarTexto("td","BAJA",inicio + "blue" + medio + "BAJA" + fin);
}

/* Cotizaciones */
function bandejaDeCotizaciones(){
	var inicio = "<div style=\"width:90px\"><img src=\"../common/images/calificaciones/";
	var medio = "\" class=\"medio\"/>&nbsp;";
	var fin = "</div>";
	reemplazarTexto("td","CALIFICAR",inicio + "calificar.png" + medio + "Calificar" + fin);
	reemplazarTexto("td","COTIZAR",inicio + "cotizar.png" + medio + "Cotizar" + fin);
	reemplazarTexto("td","ENTREGAR",inicio + "entregar.png" + medio + "Entregar" + fin);
	reemplazarTexto("td","FALTANTES",inicio + "faltantes.png" + medio + "Faltantes" + fin);
	reemplazarTexto("td","NEGATIVO",inicio + "negativo.png" + medio + "Negativo" + fin);
	reemplazarTexto("td","NEUTRAL",inicio + "neutral.png" + medio + "Neutral" + fin);
	reemplazarTexto("td","POSITIVO",inicio + "positivo.png" + medio + "Positivo" + fin);
	reemplazarTexto("td","REALIZANDO",inicio + "realizando.png" + medio + "Realizando" + fin);
	reemplazarTexto("td","*","<i class='fas fa-envelope'></i>");
}

/* Distribución digital */

function distribucionDigitalListaDeEnviosYEventos(){
	var inicio = "<span class='emResaltar' style='color:";
	var medio = "'>";
	var fin = "</span>";
	reemplazarTexto("td","Rechazo",inicio + "red" + medio + "Rechazo" + fin);
	reemplazarTexto("td","Error",inicio + "red" + medio + "Error" + fin);
	reemplazarTexto("td","Problema",inicio + "red" + medio + "Problema" + fin);
}

function clientesCompletarEmailYTelefono(){
	
	//Recorre todas las celdas que contentgan información de error en la carga
	var i = -1;
	$(".celdaInformacionError").each(function(){
		//Recupera el contenido de la celda
		var error = $(this).text().trim();
		var hayError = error.length;
		i++;
		//Si hay error, continúa
		if (hayError > 0){
			//Muestra sección de mensajes de error
			$("#error_general").show();
			//Recupera la fila
			$(this).parent().addClass("filaDeError");
			//Recupera el campo con error
			switch(error){
				case "E":
					$("#celdaInformacionCorreoe_" + i).addClass("celdaDeError");				
					$("#error_correo").show();
					break;
				case "T":
					$("#celdaInformacionCelular_" + i).addClass("celdaDeError");
					$("#error_celular").show();
					break;
				case "?":
					$("#celdaInformacionCorreoe_" + i).addClass("celdaDeError");
					$("#error_rechazado").show();
					break;
				case "R":
					$("#celdaInformacionCorreoe_" + i).addClass("celdaDeError");
					$("#error_repetido").show();
					break;
				case "P":
					$("#celdaInformacionCorreoe_" + i).addClass("celdaDeError");
					$("#error_portal").show();
					break;
			}
		}
	});

	//Si hay filas vacías, las elimina
	$(".celdaInformacionNombre").each(function(){
		//Recupera el contenido de la celda
		var hayContenido = $(this).text().trim().length;
		//Si no hay contenido, elimina la fila
		if (hayContenido == 0){
			$(this).parent().remove();
		}
	});

}

/* Archivos adjuntos */

var options = {
		success: adjuntos_showResponse
}
var adjuntos_usuario = "";
var adjuntos_tag = "";
var adjuntos_hash = "";

function adjuntos_mostrarProgreso(idFormulario){
	//Muestra una imagen en la sección de archivos ya subidos
	var subiendo_img = document.createElement("img");
	subiendo_img.setAttribute('src', '../common/images/adjuntos/subiendoArchivo.gif');
	subiendo_img.setAttribute('alt', 'Subiendo...');
	document.getElementById("adjuntos_subiendo").appendChild(subiendo_img);
	//Obtiene la dirección del archivo
	var campo = document.getElementById("datos" + idFormulario);
	if (campo != null){
		var valor = campo.value;
		//Si el campo tiene información, crea la imagen con los atributos correspondientes
		if (valor != ""){
			//Inserta imagen
			var img = document.createElement("img");
			img.setAttribute('src', '../common/images/adjuntos/subiendo.gif');
			img.setAttribute('alt', 'Subiendo...');
			img.setAttribute('class', 'adjuntos_progreso');
			document.getElementById("progreso" + idFormulario).appendChild(img);
		}
	}
}

function adjuntos_mostrarOk(adjuntos_usuario,adjuntos_tag,adjuntos_hash){
	//Reemplaza todas las imágenes de progreso por tildes
	$(".adjuntos_progreso").attr('src', '../common/images/adjuntos/ok.png');
	//Actualiza las imágenes
	var nocache = Math.random();
	$("#adjuntos_conjunto").load("../secciones/galeriaAdjuntos.jsp?usuario=" + adjuntos_usuario + "&tag=" + adjuntos_tag + "&hash=" + adjuntos_hash + "&id=" + nocache);
}

function adjuntos_adjuntar(idFormulario,usuario,tag,hash){
	if (adjuntos_validar(idFormulario)){
		adjuntos_usuario = usuario;
		adjuntos_tag = tag;
		adjuntos_hash = hash;
		$("#formulario" + idFormulario).ajaxSubmit(options);		
		adjuntos_mostrarProgreso(idFormulario);
	}
}

function adjuntos_eliminar(formulario,usuario,tag,hash){
	adjuntos_usuario = usuario;
	adjuntos_tag = tag;
	adjuntos_hash = hash;
	$("#" + formulario).ajaxSubmit(options);
}

function adjuntos_showResponse(responseText, statusText, xhr, $form){
	adjuntos_mostrarOk(adjuntos_usuario,adjuntos_tag,adjuntos_hash);
}

function adjuntos_validar(idFormulario){
	var pasa = true;
	var id = "datos" + idFormulario;
	var campo = $("#" + id);
	var nombre = id;
	var nombreError = nombre + "error";
	var input = document.getElementById(nombre);
	var archivo = input.files[0];
	if (archivo != null){
		if (!adjuntos_PesoOK(archivo)){
			pasa = false;
			if (document.getElementById(nombreError).innerHTML)
				document.getElementById(nombreError).innerHTML = '<br><img src="../common/images/adjuntos/error.png" alt="ERROR" /> Excede los 10 MB.';
			
			document.getElementById(nombre).className = "HATSINPUTERROR cuadroAjustado";
		} else if (!adjuntos_ExtOK(archivo)){
			pasa = false;
			if (document.getElementById(nombreError).innerHTML)
				document.getElementById(nombreError).innerHTML = '<br><img src="../common/images/adjuntos/error.png" alt="ERROR" /> Extensi\u00f3n no v\u00e1lida.';
			
			document.getElementById(nombre).className = "HATSINPUTERROR cuadroAjustado";
		} else {
			if (document.getElementById(nombreError).innerHTML)
				document.getElementById(nombreError).innerHTML = '';
			
			document.getElementById(nombre).className = "HATSINPUT cuadroAjustado";
		}	
	}
	return pasa;
}

function adjuntos_PesoOK(archivo){	
	if (archivo.size > 10485760){
		return false;
	}
	return true;
}

function adjuntos_ExtOK(archivo){
	var nombre = archivo.name.toLowerCase();
	var ext = nombre.substring(nombre.lastIndexOf("."), nombre.length);
	var extPermitidas = document.getElementById("extensiones").value; 
	if (extPermitidas.indexOf(ext) == -1){
		return false;
	}
	return true;
}

function adjuntos_tipoAdjuntos(carnet,fotos,cedula,exposicion,constancia){
	//Recupera los campos
	var campos = $(".adjuntos_tipo");
	//Le asigna a cada campo el valor que corresponda
	campos[0][0].value = carnet;
	campos[0][1].value = fotos;
	campos[0][2].value = cedula;
	campos[0][3].value = exposicion;
	campos[0][4].value = constancia;
}

/* Formulario de predenuncia de siniestros */

/** Utilizado para marcar partes de un auto **/

function sin_marcarLugarLista(id){
	//Elimina las marcas anteriores
	sin_marcarLugarListaLimpiar();
	//Recupera la lista
	var lista = $(".sin-ListaDeImagenes")[0];
	//Le asigna el nuevo valor	
	lista.value = id;
	//Solamente continúa si alguna opción de la lista está seleccionada
	if ((id != "") && (id != null)){
		//Obtiene la posición donde debe ir la marca
		var arreglo = document.getElementById("area" + id).getAttribute('coords').split(",");
		var top = sin_areaImagenCentro(arreglo,"y");
		var left = sin_areaImagenCentro(arreglo,"x");
		//Crea la imagen con los atributos correspondientes
		var img = document.createElement("img");
		img.setAttribute('src', '../common/images/indicaciones/indicacionesEleccion.png');
		img.setAttribute('alt', '*');
		//Crea el enlace
		var a = document.createElement("a");
		a.setAttribute('href', 'javascript:sin_marcarLugarLista(\'\')');
		img.setAttribute('class', 'indicacionesEleccion');
		a.setAttribute('style', 'top: ' + top + 'px; left: ' + left + 'px;');
		a.appendChild(img);
		//Inserta el enlace
		document.getElementById("sin-OpcionesVisualesSeleccion").appendChild(a);
	}
}

function sin_marcarLugarListaLimpiar(){
	//Recupera la lista y le asigna el nuevo valor
	var lista = $(".sin-ListaDeImagenes")[0];
	lista.value = "";
	//Recupera todas las imágenes de indicación y las elimina
	$(".indicacionesEleccion").remove();
}

function sin_marcarAutoLetra(id){
	//Recupera todos los campos
	var campos = $(".sin-AutoMarcasLetra");
	//Recorre hasta encontrar alguno vac�o
	var encontrado = false;
	var i = 0;
	var max = campos.length;
	while ((i < max) && (!encontrado)) {
	    if (campos[i].value == ""){
	    	campos[i].value = id;
	    	encontrado = true;
	    }
		i++;
	}
	if (!encontrado){
		if (document.getElementById("sin-ErrorMapaDeImagen"))
			document.getElementById("sin-ErrorMapaDeImagen").innerHTML = "<p>No es posible seleccionar m\u00e1s de " + max + " elementos en esta instancia.</p>";
	} else {
		//Si hay espacio, incorpora al campo correspondiente
		sin_marcarAutoVisual(id,"Letra");
	}
}
function sin_desmarcarAutoLetra(id){
	sin_desmarcarAutoVisual(id,"Letra");
	//Recupera todos los campos
	var campos = $(".sin-AutoMarcasLetra");
	//Recorre hasta encontrar de d�nde debe eliminarse
	var encontrado = false;
	var i = 0;
	var max = campos.length;
	while ((i < max) && (!encontrado)) {
	    if (campos[i].value == id){
	    	campos[i].value = "";
	    	encontrado = true;
	    }
		i++;
	}
	//Elimina los mensajes de error
	if (document.getElementById("sin-ErrorMapaDeImagen"))
		document.getElementById("sin-ErrorMapaDeImagen").innerHTML = "";
}

function sin_marcarAutoOpcion(id){
	//Recupera todos los campos
	var campos = $(".sin-AutoMarcasOpcion");
	//Marca el campo que corresponda seg�n el ID
	campos[id].checked=1;
	sin_marcarAutoVisual(id,"Opcion");
	setCheckboxValue(campos[id]);
}
function sin_desmarcarAutoOpcion(id){
	//Recupera todos los campos
	var campos = $(".sin-AutoMarcasOpcion");
	//Marca el campo que corresponda seg�n el ID
	campos[id].checked=0;
	setCheckboxValue(campos[id]);
	sin_desmarcarAutoVisual(id,"Opcion");
}

function sin_marcarAutoVisual(id,tipo){
	//Obtiene la posici�n donde debe ir la marca
	var arreglo = document.getElementById("area" + id).getAttribute('coords').split(",");
	var top = sin_areaImagenCentro(arreglo,"y");
	var left = sin_areaImagenCentro(arreglo,"x");
	//Crea la imagen con los atributos correspondientes
	var img = document.createElement("img");
	img.setAttribute('src', '../common/images/indicaciones/indicacionesEleccion.png');
	img.setAttribute('alt', '*');
	//Crea el enlace
	var a = document.createElement("a");
	a.setAttribute('href', 'javascript:sin_desmarcarAuto' + tipo + '(\'' + id + '\')');
	a.setAttribute('id', 'marca' + id);
	a.setAttribute('style', 'top: ' + top + 'px; left: ' + left + 'px;');
	a.appendChild(img);
	//Inserta el enlace
	document.getElementById("sin-Auto").appendChild(a);
	//Reemplaza el enlace actual
	document.getElementById("area" + id).setAttribute('href', a.getAttribute('href'));
}

function sin_desmarcarAutoVisual(id,tipo){
	//Elimina la marca
	var marca = document.getElementById("marca" + id);
	document.getElementById("sin-Auto").removeChild(marca);
	//Actualiza el enlace del �rea
	document.getElementById("area" + id).setAttribute('href', 'javascript:sin_marcarAuto' + tipo + '(\'' + id + '\')');
}

sin_anchoDeMarca = 24;
function sin_areaImagenCentro(coordenadas,posicion){
	//Inicializa variables
	var resultado = 0;
	var cantidadDeCoordenadas = coordenadas.length;
	//Primer valor a recuperar para el cálculo, según se busque X o Y	
	var pos = 0; //Para X
	if ((posicion == "y") || (posicion == "Y")){ //Para Y
		pos++;
	}
	//Según la cantidad de coordenadas recupera el tipo de figura
	switch (cantidadDeCoordenadas){
	case 3: //Círculo
		resultado = coordenadas[pos] - sin_anchoDeMarca / 2;
		break;
	case 4: //Cuadrado
		resultado = Math.round((coordenadas[pos+2] - coordenadas[pos]) / 2) + Number(coordenadas[pos]) - sin_anchoDeMarca / 2;
		break;
	default: //Polígono
		var minimo = 99999;
		var maximo = 0;
		for (i = pos; i < cantidadDeCoordenadas; i+2){
			if (coordenadas[i] < minimo){
				minimo = Number(coordenadas[i]);
			}
			if (coordenadas[i] > maximo){
				maximo = Number(coordenadas[i]);
			}
			i = i+2;
		}		
		resultado = Math.round((maximo - minimo) / 2) + Number(minimo) - sin_anchoDeMarca / 2;
	}
	return resultado;
}

var marcas = $('.sin-AutoMarcasLetra');
var cantidadMarcas = marcas.length;
if (cantidadMarcas > 0){
	for (i = 0; i < cantidadMarcas; i++){		
		var valor = marcas[i].value;
		if (valor != ""){
			sin_marcarAutoVisual(valor,"Letra");
	    }
	}		
} else {
	marcas = $('.sin-AutoMarcasOpcion');
	cantidadMarcas = marcas.length;
	for (j = 0; j < cantidadMarcas; j++){
		if (marcas[j].checked){				
			sin_marcarAutoVisual(j,"Opcion");
	    }
	}
}

/** Utilizado para marcar situaciones de choque **/

function sin_marcarSituacion(id){
	//Elimina las marcas anteriores
	sin_marcarSituacionLimpiar();
	//Recupera la lista
	var lista = $(".sin-IdSituacion")[0];
	//Le asigna el nuevo valor
	lista.value = id;
	//Marca como seleccionado el enlace (si existe)
	if (id != ""){
		document.getElementById("situacion_" + id).className = "sin-Seleccionado";
		//Muestra u oculta la secci�n de otro seleccionado seg�n corresponda
		if (id == "?"){
			mostrar('seccionOtroSeleccionado');
		} else {
			ocultar('seccionOtroSeleccionado');
		}
	}
}

function sin_marcarSituacionLimpiar(){
	//Elimina la selecci�n de todos los elementos
	var lista = $(".sin-Seleccionado");
	for (var i = 0; i < lista.length; i++){
		lista[i].className = "";
	}
}

function sin_marcarMapaAlCargar(){
	var marcas = $('.sin-AutoMarcasLetra');
	var cantidadMarcas = marcas.length;
	if (cantidadMarcas > 0){
		for (i = 0; i < cantidadMarcas; i++){		
			var valor = marcas[i].value;
			if (valor != ""){
				sin_marcarAutoVisual(valor,"Letra");
		    }
		}		
	} else {
		marcas = $('.sin-AutoMarcasOpcion');
		cantidadMarcas = marcas.length;
		for (j = 0; j < cantidadMarcas; j++){
			if (marcas[j].checked){				
				sin_marcarAutoVisual(j,"Opcion");
		    }
		}
	}
}

/** Voucher de reposición **/

function sin_voucherReponer(){
	//Recupera el elemento al que debe incorporarse la opci�n en el onchange
	var elemento = $(".sin-VoucherReponer")[0];
	//Incorpora la opci�n
	elemento.setAttribute("onchange","sin_voucherReponerMostrar(this);");
	//Muestra s�lo lo que corresponda seg�n la opci�n elegida
	sin_voucherReponerMostrar(elemento);
}

function sin_voucherReponerMostrar(eleccion){
	//Oculta todas las listas de opciones
	$(".listaOpcion").hide();
	//¿Se seleccionó alguna opción?
	if (eleccion.value !== ""){
		//Muestra sólo la lista que corresponde
		var idOpcion = "#listaOpcion" + eleccion.value;
		$(idOpcion).show();
	}
}

/* Preliquidaciones */

function bandejaDePreliquidaciones(){
	var inicio = "<span class='emResaltar' style='color:";
	var medio = "'>";
	var fin = "</span>";
	reemplazarTexto("td","rendida",inicio + "green" + medio + "rendida" + fin);
}


function desactivarBotonConInputsVacios(inputs, button) {
	button.disabled = true
	var inputsValidos = [];
	inputs.forEach(function(input){
		input.addEventListener("input", function(){
			inputsValidos = inputs.filter(function(input){
				return input.value.length > 0;
			})
			if( inputsValidos.length === inputs.length) {
				button.disabled = false;
			}else{
				button.disabled = true;
			}
		});
	})
}