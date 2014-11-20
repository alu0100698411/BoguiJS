
function Bogui(img, id, name) {
	//ATRIBUTOS
	this.ident = id;
	this.modo = window.modoImagen;
	this.imagen = img;
	this.formato = quitarFormato(name)[2];
	this.nombre = evitarNombresRepetidos(quitarFormato(name)[1]);
	this.imgCanvas;
	this.regCanvas;
	this.ctx;
	this.regctx;
	this.click = false;
	
	this.histograma = new Array(256);
	this.histogramaAcumulativo = new Array(256);
	this.dialogoHistograma;
	this.contenedorHistograma;
	this.dialogoHistogramaAcumulativo;
	this.contenedorHistogramaAcumulativo;
	this.mouseXini = 0; //Variables para funciones que requieras capturar posiciones de raton
	this.mouseYini = 0;
	this.mouseXfin = 0; //Variables para funciones que requieras capturar posiciones de raton
	this.mouseYfin = 0;
	
	//METODOS

	
	this.imgCanvas = document.createElement("canvas");
	this.imgCanvas.setAttribute("id", "canvas"+this.ident);
	this.imgCanvas.setAttribute("height", this.imagen.height);
	this.imgCanvas.setAttribute("width", this.imagen.width);
	this.imgCanvas.setAttribute("class", "capaCanvas");

	
	//Crear ventana con el canvas
	this.dialogo = $('<div/>', {
	    id: "dialogo" + this.ident,
		title: this.nombre,
	   	height: window.maxHeight,
		width: window.maxWidth	
	}).appendTo('#workspace');



	var canvasContainer = $("<div id=\"canvasContainer"+this.ident+"\" class=\"canvasContainer\"></div>");
	canvasContainer.append(this.imgCanvas);

	this.dialogo.dialog({ resizable: false });
	
	this.dialogo.on("dialogclose",function(e){			
		var exp = /dialogo(\d+)/i
		var res = exp.exec(e.target.id);
		var idActual = res[1];
		borrarObjetoBogui(idActual);
		$(this).dialog( "close" );
		$(this).remove();	
 	});
	
	this.dialogo.on( "dialogfocus", function( e, ui ) {
						var exp = /dialogo(\d+)/i
						var res = exp.exec(e.target.id);
						var idActual = res[1];
						cambiarFoco(idActual);
						} );

	//Dibujar imagen en el canvas
	this.ctx = this.imgCanvas.getContext('2d');
	this.ctx.drawImage(this.imagen, 0, 0);

	//Reducir imagen y ponerla en blanco y negro
	reducirImagen(this);
	RGBA2BW(this);



	this.regCanvas = document.createElement("canvas");
	this.regCanvas.setAttribute("id", "canvasreg"+this.ident);
	this.regCanvas.setAttribute("height", this.imgCanvas.height);
	this.regCanvas.setAttribute("width", this.imgCanvas.width);
	this.regCanvas.setAttribute("z-index", 1);
	this.regCanvas.setAttribute("class", "capaCanvas");

	
	canvasContainer.append(this.regCanvas);
	canvasContainer.append("<div style=\"clear:both\"></div>");
	canvasContainer.css("height",this.imgCanvas.height+"px");
	canvasContainer.css("width",this.imgCanvas.width+"px");
	
	$('.ui-dialog :button').blur();//REMOVE FOCUS
	
	this.dialogo.append(canvasContainer);
	this.dialogo.append("<div id=\"position"+this.ident+"\"><span id=\"coordinates"+this.ident+"\">x= - y= - value= - </span></div>");
	//Ajustar tamaño de la ventana
	this.dialogo.dialog("option", "width", this.imgCanvas.width + 24); 
	this.dialogo.css("overflow","hidden");
	

	//Listeners del canvas
	$(this.regCanvas).mousedown(function(e){

		
		var exp = /canvasreg(\d+)/i
		var res = exp.exec(e.target.id);
		var idActual = res[1];

		switch(window.herramientaActual){
			case "roi":	
						objetosBogui[obtenerPosArray(idActual)].click = true;
						var pos = findPos(this);
				        objetosBogui[obtenerPosArray(idActual)].mouseXini = e.pageX - pos.x;        
				        objetosBogui[obtenerPosArray(idActual)].mouseYini = e.pageY - pos.y;
			break;
			case "ics":	
						objetosBogui[obtenerPosArray(idActual)].click = true;
						var pos = findPos(this);
				        objetosBogui[obtenerPosArray(idActual)].mouseXini = e.pageX - pos.x;        
				        objetosBogui[obtenerPosArray(idActual)].mouseYini = e.pageY - pos.y;
			break;
			default:
        }
	});

	$(this.regCanvas).mouseup(function(e){
		
		var exp = /canvasreg(\d+)/i
		var res = exp.exec(e.target.id);
		var idActual = res[1];

		switch(window.herramientaActual){
			case "roi":
				objetosBogui[obtenerPosArray(idActual)].click = false;
				var pos = findPos(this);
		        objetosBogui[obtenerPosArray(idActual)].mouseXfin = e.pageX - pos.x;
		        objetosBogui[obtenerPosArray(idActual)].mouseYfin = e.pageY - pos.y;
				dibujarRegionInteres(objetosBogui[obtenerPosArray(idActual)]);
			break;
			case "ics":
				objetosBogui[obtenerPosArray(idActual)].click = false;
				var pos = findPos(this);
		        objetosBogui[obtenerPosArray(idActual)].mouseXfin = e.pageX - pos.x;
		        objetosBogui[obtenerPosArray(idActual)].mouseYfin = e.pageY - pos.y;
				dibujarLineaICS(objetosBogui[obtenerPosArray(idActual)]);
			break;
			default:
        }
	});

	$(this.regCanvas).mousemove(function(e) {

        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;

        var exp = /canvasreg(\d+)/i
		var res = exp.exec(e.target.id);
		var idActual = res[1];

		switch(window.herramientaActual){
			case "roi":
		        if(objetosBogui[obtenerPosArray(idActual)].click == true){
		        	var estado = 0;
			        objetosBogui[obtenerPosArray(idActual)].mouseXfin = e.pageX - pos.x;
			        objetosBogui[obtenerPosArray(idActual)].mouseYfin = e.pageY - pos.y;
			        objetosBogui[obtenerPosArray(idActual)].mouseXfin = e.pageX - pos.x;
		        	objetosBogui[obtenerPosArray(idActual)].mouseYfin = e.pageY - pos.y;
					dibujarRegionInteres(objetosBogui[obtenerPosArray(idActual)], estado);
				}
			break;
			case "ics":
		        if(objetosBogui[obtenerPosArray(idActual)].click == true){
		        	var estado = 0;
			        objetosBogui[obtenerPosArray(idActual)].mouseXfin = e.pageX - pos.x;
			        objetosBogui[obtenerPosArray(idActual)].mouseYfin = e.pageY - pos.y;
			        objetosBogui[obtenerPosArray(idActual)].mouseXfin = e.pageX - pos.x;
		        	objetosBogui[obtenerPosArray(idActual)].mouseYfin = e.pageY - pos.y;
					dibujarLineaICS(objetosBogui[obtenerPosArray(idActual)]);
				}
			break;
			default:
        }

        var p = objetosBogui[obtenerPosArray(idActual)].ctx.getImageData(x, y, 1, 1).data;
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
        var rgb = obtenerColorDesdeCoordenadas(objetosBogui[obtenerPosArray(idActual)],x,y);
		if(x >= 0 && y >= 0){
			$("#coordinates"+ objetosBogui[obtenerPosArray(idActual)].ident).html("x=" + x + " y=" + y + " Hex=" + hex + " RGB=" + rgb);
		}
                

    });		
}

function calcularBrilloContraste(objetoBoguiActual){
		calcularHistogramaSimple(objetoBoguiActual);
		var brillo = 0;
		var contraste = 0;
		var total = 0;
		
		//BRILLO
		for (i = 0; i < objetoBoguiActual.histograma.length; i++) {
			brillo += objetoBoguiActual.histograma[i] * i;
			total = total + objetoBoguiActual.histograma[i];
		}

		brillo = brillo/total;

		//CONTRASTE
		for (i = 0; i < objetoBoguiActual.histograma.length; i++){
			contraste += objetoBoguiActual.histograma[i] * Math.pow( (brillo-i) ,2 );
		}

		contraste = Math.sqrt(contraste/total);
		return [brillo, contraste];
}

function calcularLimitesColor(objetoBoguiActual){
	calcularHistogramaSimple(objetoBoguiActual);
	valorMinimo = 0;
	valorMaximo = 255;
	while(objetoBoguiActual.histograma[valorMinimo] == 0){
		valorMinimo++;
	}
	while(objetoBoguiActual.histograma[valorMaximo] == 0){
		valorMaximo--;
	}
	return [valorMinimo, valorMaximo];
}

function reducirImagen(objetoBoguiActual){

	//Hacer un nuevo canvas
	var canvasCopy = document.createElement("canvas");
	var copyContext = canvasCopy.getContext("2d");

	// Determinar el ratio de conversion de la imagen
	var ratio = 1;
	if(objetoBoguiActual.imagen.width > window.maxWidth)
		ratio = window.maxWidth / objetoBoguiActual.imagen.width;
	else if(objetoBoguiActual.imagen.height > window.maxHeight)
		ratio = window.maxHeight / objetoBoguiActual.imagen.height;

	//Dibujar la imagen original en el segundo canvas
	canvasCopy.width = objetoBoguiActual.imagen.width;
	canvasCopy.height = objetoBoguiActual.imagen.height;
	copyContext.drawImage(objetoBoguiActual.imagen, 0, 0);
	//Copiar y cambiar de tamño el segundo canvas en el primer canvas
	objetoBoguiActual.imgCanvas.width = objetoBoguiActual.imagen.width * ratio;
	objetoBoguiActual.imgCanvas.height = objetoBoguiActual.imagen.height * ratio;
	objetoBoguiActual.ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, objetoBoguiActual.imgCanvas.width, objetoBoguiActual.imgCanvas.height);

}

function calcularHistogramaSimple(objetoBoguiActual){
	var imageData = objetoBoguiActual.ctx.getImageData(0, 0, objetoBoguiActual.imgCanvas.width, objetoBoguiActual.imgCanvas.height);
   	var pixelData = imageData.data;

	//Inicializar Variables
	for(i = 0; i < objetoBoguiActual.histograma.length; i++) {
		objetoBoguiActual.histograma[i] = 0;
	}
	
	//Rellenar histograma Simple
   	for(j = 0; j < pixelData.length; j += 4) {
		objetoBoguiActual.histograma[pixelData[j]]++; 
	}
}

function calcularHistogramaAcumulativo(objetoBoguiActual){
	calcularHistogramaSimple(objetoBoguiActual);
	//Inicializar Variables
	for(i = 0; i < objetoBoguiActual.histograma.length; i++) {
		objetoBoguiActual.histogramaAcumulativo[i] = 0; 
	}

	//Rellenar histograma Acumulativo
	objetoBoguiActual.histogramaAcumulativo[0] = objetoBoguiActual.histograma[0]; 
	for(k = 1; k < objetoBoguiActual.histograma.length; k++) {
		objetoBoguiActual.histogramaAcumulativo[k] = objetoBoguiActual.histograma[k] + objetoBoguiActual.histogramaAcumulativo[k-1]; 
	}
}

function calcularEntropia(objetoBoguiActual){
	if(typeof objetoBoguiActual == 'undefined'){
		mostrarError("No se puede ejecutar el comando sin una imagen seleccionada"); 
	}else{

		calcularHistogramaSimple(objetoBoguiActual);
		var total = 0;
		var entropia = 0;
	 	for (i = 0; i < objetoBoguiActual.histograma.length; i++){
	 		total += objetoBoguiActual.histograma[i];
	 	}

	    for (i = 0; i < objetoBoguiActual.histograma.length; i++){

			probabilidad = objetoBoguiActual.histograma[i] / total;

			if(probabilidad != 0){
			    entropia += probabilidad * Math.log(probabilidad, 2);
			}
		}		
		return -entropia;			
	}
}

function evitarNombresRepetidos(nombre){

	var exp = /(.*)\(.+\)/g
	var nombreAux = nombre;
	
	if(nombre.match(exp)){
		var res = exp.exec(nombre);
		nombreAux = res[1];
	}
	var nuevoNombre = nombreAux;
	var repetido = true;

	var numeroRepeticiones = 1;
	while(repetido == true){
		repetido = false;
		for(i = 0; i < objetosBogui.length; i++){
			if(objetosBogui[i].nombre == nuevoNombre){
				repetido = true;
				nuevoNombre = nombreAux +"("+numeroRepeticiones+")"
				numeroRepeticiones++;
			}
		}
	}
	return nuevoNombre;
}

function quitarFormato(cadena){
	var exp = /(.*)(\..*)/g
	var res = exp.exec(cadena);
	if(res == null){
		return cadena;
	}
	else{
		return res;	
	}
}

//Metodos para la posicion, color y nivel de intesidad
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function rgbToHex(r, g, b){
        if (r > 255 || g > 255 || b > 255)
                throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
}

function obtenerColorDesdeCoordenadas(objetoBoguiActual, posx, posy){

	var imageData = objetoBoguiActual.ctx.getImageData(0, 0, objetoBoguiActual.imagen.width, objetoBoguiActual.imagen.height);
	var pixelData = imageData.data;
	var bytesPerPixel = 4;
	var startIdx = (posy * bytesPerPixel * objetoBoguiActual.imagen.width) + (posx * bytesPerPixel);

	return [pixelData[startIdx], pixelData[startIdx + 1], pixelData[startIdx + 2]];
}

function RGBA2BW(objetoBoguiActual){

	//Obtener la matriz de datos.
	var imageData = objetoBoguiActual.ctx.getImageData(0, 0, objetoBoguiActual.imagen.width, objetoBoguiActual.imagen.height);
   	var pixelData = imageData.data;
   	var bytesPerPixel = 4;

	//Modificar los valores RGB para pasarlos a B&W
   	for(var y = 0; y < objetoBoguiActual.imagen.height; y++) {
      		for(var x = 0; x < objetoBoguiActual.imagen.width; x++) {
			 var startIdx = (y * bytesPerPixel * objetoBoguiActual.imagen.width) + (x * bytesPerPixel);

			 var red = pixelData[startIdx];
			 var green = pixelData[startIdx + 1];
			 var blue = pixelData[startIdx + 2];
			 //Cambiar para NTSC Y PAL Y PONER LOS VALORES DEL GUION
			
			 var grayScale;

			 switch(objetoBoguiActual.modo){
				 case "PAL":
					 grayScale = (red * 0.222) + (green * 0.707) + (blue * 0.071);
					 break;
				 case "NTSC":
					 grayScale = (red * 0.2999) + (green * 0.587) + (blue * 0.114);
					 break;
			 }

			 pixelData[startIdx] = grayScale;
			 pixelData[startIdx + 1] = grayScale;
			 pixelData[startIdx + 2] = grayScale;
	      	}
	   }
	//Cargar la matriz de datos en el canvas
	objetoBoguiActual.ctx.putImageData(imageData, 0, 0);

}

function readImage(file) {
  
    var reader = new FileReader();
    var image  = new Image();
  
    reader.readAsDataURL(file);  
    reader.onload = function(_file) {
        image.src    = _file.target.result;              // url.createObjectURL(file);
        image.onload = function() {
                objetosBogui.push(new Bogui(image, numeroObjetos, file.name));
                cambiarFoco(numeroObjetos);
                numeroObjetos++;

        };
        image.onerror= function() {
            alert('Invalid file type: '+ file.type);
        };      
    };    
}

function descargarImagen(objetoBoguiActual, formato){

	var dataUrl;
	var link = document.createElement('a');
   	
	switch(formato){
	case "png":
		dataUrl = objetoBoguiActual.imgCanvas.toDataURL('image/png', 1); // obtenemos la imagen como png
		dataUrl = dataUrl.replace("image/png",'image/octet-stream'); // sustituimos el tipo por octet
		link.download = objetoBoguiActual.nombre + ".png";
		break;
	case "jpeg":
		dataUrl = objetoBoguiActual.imgCanvas.toDataURL('image/jpeg', 1);
		dataUrl = dataUrl.replace("image/jpeg",'image/octet-stream'); // sustituimos el tipo por octet
		link.download = objetoBoguiActual.nombre + ".jpeg";
		break;
	case "webp":
		dataUrl = objetoBoguiActual.imgCanvas.toDataURL('image/webp', 1);
		dataUrl = dataUrl.replace("image/webp",'image/octet-stream'); // sustituimos el tipo por octet
		link.download = objetoBoguiActual.nombre + ".webp";
		break;
	default:
		dataUrl = objetoBoguiActual.imgCanvas.toDataURL();
		dataUrl = dataUrl.replace("image/png",'image/octet-stream'); // sustituimos el tipo por octet
		link.download = objetoBoguiActual.nombre + ".png";
	}
	link.href = dataUrl;
   	link.click();
}