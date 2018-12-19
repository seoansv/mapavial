
    jQuery('#modal-provincia').on('show.bs.modal', function (event) {
        var launcher = jQuery(event.relatedTarget) // Button that triggered the modal
        //var recipient = button.data('whatever') // Extract info from data-* attributes
        var idProv = launcher[0].id.replace("lnk-", "" ).replace(/-/g , "_" );
        //console.log("Codigo de provincia: " + idProv );
		if( idProv == '')
			idProv = "tierra_del_fuego";
		var dp = dataPais.getDataProvByName( idProv);

        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = jQuery(this);
        modal.find('.mt-0').text('Estadísticas viales de la provincia de ' + dp.provincia);
        
        var outHtml = dp.getHtml();
        jQuery( '#contenido-provincia' ).html( outHtml );

})


    // https://spreadsheets.google.com/feeds/list/1muIEfdY_xGbPROvxe8Ru8tYr7H4kMXqvLLVDJ7GifxI/1/public/values?alt=json

	//https://spreadsheets.google.com/feeds/list/1J5jDnUBqGbro0MYs_rE6AFdxIVFWoho7Fq9HEi7loK8/1/public/values?alt=json

    var preKey = 'https://spreadsheets.google.com/feeds/list/';
    var keySpreadsheet = '1J5jDnUBqGbro0MYs_rE6AFdxIVFWoho7Fq9HEi7loK8';
    var postKey = '/1/public/values?alt=json';
    var sheet = '';
 
    var urlData = preKey + keySpreadsheet  +  postKey + sheet;//alert(urlData);
    var dataProvincia = [];
    var dataPais;
    
    jQuery.ajax({
            url: urlData,
            type: "GET",
            contentType: 'text/plain',
            xhrFields: {
              withCredentials: false
            },
            success: function (response) {
                //var resp = JSON.parse(response)
                //alert(resp.status);
                var rows = response.feed.entry;
                var outHtml = '';
                rows.forEach(row => {
                    var dp = new DataProvincia(row);
                    dataProvincia.push(  dp );
                    outHtml += dp.getHtml();
                });
                dataPais = new DataPais( dataProvincia);
                
				//Renombra los textos asociados a cada provincia del mapa
				MapaSvg.configure();
				
                //Genera botonera  
                jQuery('#botonera').html( DataProvincia.getHtmlBotonera());

				jQuery('#botonera > a').tooltip({placement : 'bottom', trigger : 'hover' });

                //Agrega eventos a los botones generados 
                jQuery('#botonera').on('click', 'a', function() {
					var datosProvinciales = dataPais.getDataPaisByVar(this.id);
					var datosProvincialesVeh;
					//alert(datosProvinciales);
					if( this.id == "porcusrmayor")
					{
					   var datosProvincialesVeh = dataPais.getDataPaisByVar("usrmayor");
					}

					var var2icono = {"auto": "\uf37d" ,"moto" : "\uf4ee", "-1" : ""};
					var var2Veh = {"auto": "Auto" ,"moto" : "Moto", "-1" : ""};
					var indexPorcUsrMayor = -1; 	 	

					for (var i = 0; i < datosProvinciales.length; i++) {
						var nameText = "#txt-" + datosProvinciales[i][0]; //key
						var text = jQuery(nameText);
						
						if( this.id == "porcusrmayor")
						{
							var veh = datosProvincialesVeh[i][2];
							text.html( var2Veh[veh] );
						}
						else
						{
							text.html( datosProvinciales[i][2] );
						}

						//Cambios de colores en las provincias
						var pathMapaProv = "g > a >path#" + datosProvinciales[i][0].replace(/_/g , "-" );
						jQuery( pathMapaProv ).attr("class", "");
						var cssClassProv = "";
						/*
						if( this.id == "porcusrmayor")
						{
							cssClassProv = datosProvinciales[6][3];
						}
						else
						{*/
							cssClassProv = datosProvinciales[i][3];
						//}
						jQuery( pathMapaProv ).attr("class", cssClassProv);
					}
                });  
            },
            error: function (xhr, status) {
                alert("error");
            }
        });

    class MapaSvg {
	
	  static configure()
      {
		//Agrega ids a los textos asociados a las provincias  
        var txtProvincias = jQuery('g#etiquetas-provincias > text');
		for (var i = 0; i < txtProvincias.length; i++) {
          var txtProv = txtProvincias[i];
		  var idTxtProv = "txt-" + MapaSvg.getNameLabel(txtProv);
		  console.log ( "IdTxtProv : " + idTxtProv);
          txtProv.setAttribute("id", idTxtProv );
		  txtProv.setAttribute("class", "st4");
		  txtProv.innerHTML = "";

			if( txtProv.id == 'txt-misiones') 
			{
				var trf = "translate(" + (txtProv.x - txtProv.width/2 ) + " " + (txtProv.y + txtProv.height/2 ) + ")";
				console.log( "-----" +  txtProv.id + " : " + trf);
				//txtProv.setAttribute("transform", trf);
			}	
		}
		
		const leyenda = 'Ver estadísticas viales de '
		//Configura cada anchor perteneciente a la provincia para que se ejecute el pop-up
		var pathProvincias = jQuery('g > a > path');
		for (var i = 0; i < pathProvincias.length; i++) {
		  var pathProv = pathProvincias[i];
		  var anchorProv =   pathProv.parentElement;
		  var idLnkProv = "lnk-" + pathProv.id;
		  //console.log( "Link provincia : " + idLnkProv); 
		  anchorProv.setAttribute("id", idLnkProv );
		  anchorProv.setAttribute( "href", "#" );
		  anchorProv.setAttribute( "class", "" );
		  anchorProv.setAttribute( "data-toggle", "modal" );
		  anchorProv.setAttribute( "data-target", "#modal-provincia" );
		  
		  var titleSvg = pathProv. getElementsByTagName('title')[0];
		  if ( !(titleSvg === undefined)){
			var currentTitle =  titleSvg.textContent;
		  	//console.log( "Title:" + currentTitle);	
		  	titleSvg.textContent = leyenda + currentTitle;			
			}
		}
      }
	  
	  //Detecta el nombre que se halla en las etiqueta y devuelve la clave de busqueda por provincia
      static getNameLabel( txtProv )
      {
		var name = '';
        var spans = txtProv.getElementsByTagName("tspan");
		if( spans.length > 0){
			for (var i = 0; i < spans.length; i++) {
				name+= spans[i].innerHTML;
			}
		}
		else
		{
			name = txtProv.innerHTML;
		}
        return  MapaSvg.codProv(name) ;
	  }
	  
	  static codProv( name ){
		var map = {
			 "Sal" : "salta",
			 "Tuc" : "tucuman",
			 "J" : "jujuy",
			 "F" : "formosa",
			 "Cha" : "chaco",
			 "Corr" : "corrientes",
			 "Mi" : "misiones",
			 "ER" : "entre_rios",
			 "CABA" : "caba",
			 "SF" : "santa_fe",
			 "Sgo" : "santiago_del_estero",
			 "Cat" : "catamarca",
			 "LR" : "la_rioja",
			 "Cor" : "cordoba",
			 "BA" : "buenos_aires",
			 "SL" : "san_luis",
			 "SJ" : "san_juan",
			 "Men" : "mendoza",
			 "LP" : "la_pampa",
			 "RN" : "rio_negro",
			 "NE" : "neuquen",
			 "Ch" : "chubut",
			 "SC" : "santa_cruz",
			 "TF" : "tierra_del_fuego"
			};
		return map[ name ];
		}
    }

    class DataPais{
      constructor(listDataProvincia){
        this.DataProvincia = listDataProvincia;
      }

      getDataProvByName(name)
      {
        var dp;
        this.DataProvincia.forEach(dataprov => {
            if( name == dataprov['keyProv'])
            {
              dp = dataprov;
              return;
            }
        });
        return dp;
      }

      getDataPaisByVar(nameVar)
      {
        var datosProvinciales = [];
        this.DataProvincia.forEach(dataprov => {
			var dp1 = [ dataprov.keyProv, dataprov.provincia,
			 dataprov[nameVar], this.var2ClassProv(nameVar,dataprov[nameVar]) ];
            console.log(dp1);
            datosProvinciales.push( dp1 );
        });
        return datosProvinciales;
      }

		//porcusrmayor - usrmayor
	   var2ClassProv(nameVar, valueVar ){

		  var infoVar = DataProvincia.infoVars().find(obj => { return obj.key === nameVar});
		  var ranges = JSON.parse(  infoVar.ranges );
		  
		  if( valueVar == '-1' ||  valueVar == -1 || valueVar == 'Sin datos' || valueVar == ''  ) 
		  	 return 'sin-datos';

		  var numValueVar = valueVar.replace( '%','').replace(',','.');	
		  if( nameVar == 'usocinturon' || nameVar == 'usocasco' || nameVar == 'usosri' 
		  || nameVar == 'vicfatalmasc' || nameVar == 'vicfatalfem' || nameVar == 'tasavictfatales2017' )
		  {
			return this.mapRange( numValueVar, ranges,'sin-datos');
		  }
		  
		  if( nameVar == 'usrmayor' || nameVar == 'mayorzonaocurrencia' ||
				 nameVar == 'rangoetario' )
		  {
			return this.mapEqual( valueVar, ranges, 'sin-datos');
		  }

		  return 'alto';
	   }

	   // mapEqual( 1, [[1,'Uno'],[2,'Dos'],[3,'Tres']], 'Cero' )
	   mapEqual( value, mapsValues, valueDefault ){
			var valExit = valueDefault;
			for( var i=0; i < mapsValues.length ;i++ )
			{
				//console.log( "" + mapsValues[i]  + " - " + value );
				if( mapsValues[i][0] == value)
				{
					valExit = mapsValues[i][1];
					console.log( "Exit en: " + mapsValues[i,1]  );
					break;
				}
			}
			return valExit;
	   }

	   mapRange( value, mapsValues, valueDefault ){
			var valExit = valueDefault;
			var limiteInf = 0;
			for( var i=0; i < mapsValues.length ;i++ )
			{
				//console.log( "" + mapsValues[i]  + " - " + value );
				if( value >= limiteInf  && value <  mapsValues[i][0] )
				{
					valExit = mapsValues[i][1];
					console.log( "Exit en: " + mapsValues[i,1]  );
					break;
				}
				limiteInf =  mapsValues[i][0];
			}
			return valExit;
	   }

	  //addText deprecated
      static addText(link) {

		 /* Código de uso deprecated
			var linksProv = jQuery('#mapa-arg > a');
			for( var link in linksProv)
			{
			DataPais.addText(linksProv[link]);
			}
			//Centrar	
			//text.setAttribute("transform", "translate(" + (box.x + box.width/2) + " " + (box.y + box.height/2) + ")");

			*/  

        var keyProv = link.id;
        console.log(keyProv);
        var path = jQuery(link).find('path')[0];
        var box = path.getBBox();
        var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		var trf = "translate(" + (box.x) + " " + (box.y + box.height/2) + ")"; 
		if( keyProv == 'lnk-misiones') 
		{
			trf = "translate(" + (box.x - box.width/2 ) + " " + (box.y + box.height/2 ) + ")";
			console.log( "-----" +  keyProv + " : " + trf);
		}
		
			
		text.setAttribute("transform", trf);
        text.textContent = keyProv;
        text.setAttribute("class", "txtValue");
        text.setAttribute("id", "txt-" + keyProv);
        link.appendChild(text);
      }

    }

    class DataProvincia {
      constructor (row)
      {
        this.keyProv = row.gsx$keyprov.$t;
        this.provincia = row.gsx$provincia.$t;
        this.mayorzonaocurrencia = row.gsx$mayorzonaocurrencia.$t;
        this.porcusrmayor = row.gsx$porcusrmayor.$t;
        this.rangoetario = row.gsx$rangoetario.$t;
        this.usocinturon = row.gsx$usocinturon.$t;
        this.tasavictfatales2017 = row.gsx$tasavictfatales2017.$t;
        this.usocasco = row.gsx$usocasco.$t;
        this.usosegmenores = row.gsx$usosegmenores.$t;
        this.usosri = row.gsx$usosri.$t;
        this.usrmayor = row.gsx$usrmayor.$t;
        this.vicfatalfem = row.gsx$vicfatalfem.$t;
        this.vicfatalmasc = row.gsx$vicfatalmasc.$t;
      };

      getHtml()
      {
        var outHtml = '<div class="row">';
        DataProvincia.infoVars().forEach(infoVar => {
            outHtml += this.getHtmlVar(infoVar);
        });
        outHtml += "</div>";
        return outHtml;
      }
    
      //Genera un atajo por variable para los pop-up
	  getHtmlVar( infoVar )
      {
        var nameVar = infoVar.key;
        var icono = infoVar.icon;
        var classHValue = 'h1';
	var showValue = this[nameVar];      

        if(nameVar == 'usrmayor')
          return '';
        
        if(nameVar == 'porcusrmayor' && this.usrmayor.startsWith("m"))
        {
        	icono = 'icono-arg-moticicleta-lineal'; //	'icono-arg-auto';
        }
		
        if( this[nameVar] == '-1' || this[nameVar] == 'Sin datos'  ) { 
          //this[nameVar] = 'Sin datos';
		  this[nameVar] = '';
          classHValue = 'sin-datos';
	  showValue = "***"; 	
        }

        return `<div class="col-xs-12 col-sm-6 col-md-4">
              <div class="panel panel-default panel-height texto-atajo" href="#">
				<div class="panel-body">
					<div class="media">
						<div class="media-left padding-5">
							<i id="${icono}" class= "${ icono + ' icono-3x text-secondary'}"></i>
						</div>
						<div class="media-body">
							<div class="${classHValue} text-gray' }"> ${ this[nameVar]  }</div>												
						</div>
					</div>
					
						<p class="mas-info lead text-center" style="padding-top:10px">${infoVar.title}</p>
						<!-- <a class="mas-info" href="#"><i id="icono-arg-lupa" class="icono-arg-lupa icono-2x"/></a>-->
						<div class="content-slide-up">
							${  infoVar.description || infoVar.title} 
						</div>
					
				</div>
              </div>
            </div>`
      }

	 
      static getHtmlBotonera()
      {
        var outHtml = '';
        DataProvincia.infoVars().forEach(infoVar => {
        	var startTpl = `<a id="${infoVar.key}" class="panel panel-default" href="#" 
		   		 				title="${infoVar.description}" >`
        	var iconoTpl = `<i class="${infoVar.icon} text-secondary icono-botonera" style="vertical-align:middle"></i>` 
			var endTpl = `${infoVar.title}</a>`
			var iconoAutoMoto = `<i class="icono-arg-auto text-secondary"></i> <i class="icono-arg-moticicleta-lineal text-secondary"></i> `;     
            
			if(infoVar.key == 'porcusrmayor')
			{
				outHtml += startTpl +  iconoAutoMoto + endTpl;
			}
			else if(infoVar.key != 'usrmayor')
			{
				outHtml += startTpl + iconoTpl + endTpl; 
			}
		  
        });  
        return outHtml;
      }

	  
      static infoVars() { return [
          { key:"usocasco", title : "Uso del casco *", icon : "icono-arg-casco", description : '% de motos que circulan con todos sus ocupantes utilizando el casco', ranges : '[[49.9,"bajo"],[74.9,"medio"],[100.0,"alto"]]' },
          { key:"usocinturon", title : "Uso del cinturón de seguridad *", icon : "icono-arg-cinturon-seguridad", description : '% de autos que circulan con todos sus ocupantes utilizando el cinturón de seguridad' , ranges : '[[39.9,"bajo"],[59.9,"medio"],[100.0,"alto"]]' },
          { key:"usosri", title : "Uso de SRI (sillita) *", icon : "icono-arg-silla-seguridad-auto" , description : '% de niños entre 0 y 4 años que viajan en asientos traseros utilizando el Sistema de Retención Infantil (SRI)' , ranges : '[[46.9,"bajo"],[100.0,"alto"]]' },
          { key:"vicfatalmasc", title : "Víctimas fatales hombre **", icon : "icono-arg-hombre" , description : '% de hombres del total de las víctimas fatales por siniestros de tránsito' , ranges : '[[74.1,"bajomedio"],[100.0,"altoalto"]]' },
          { key:"vicfatalfem", title : "Víctimas fatales mujer **", icon : "icono-arg-mujer" , description : '% de mujeres del total de las víctimas fatales por siniestros de tránsito' , ranges : '[[25.9,"bajo"],[100.0,"alto"]]' },
          { key:"rangoetario", title : "Rango etario **", icon : "icono-arg-familia-02" , description : 'Rango etario que concentra la mayor proporción de víctimas fatales' , ranges : '[["5-14","bajo"],["15-24","medio"],["25-34","alto"],["35-44","bajomedio"],["45-54","medioalto"],["55-64","altoalto"]]' },
		  { key:"porcusrmayor", title : "Usuarios de la vía **", icon : "icono-arg-auto" , description : 'Tipo de vehículo que concentra la mayor proporción de víctimas fatales' , ranges : '[["moto","bajo"],["auto","alto"]]' },
          { key:"usrmayor", title : "Usuarios de la vía **", icon : "icono-arg-motocicleta-lineal" , description : 'Tipo de vehículo que concentra la mayor proporción de víctimas fatales' , ranges : '[["moto","bajo"],["auto","alto"]]' }, // Motocicleta o auto
		  { key:"mayorzonaocurrencia", title : "Zona de ocurrencia del siniestro **", icon : "icono-arg-marcador-ubicacion-1" , description : 'Área que concentra la mayor proporción de víctimas fatales', ranges : '[["Rural","bajo"],["Rural/Urbano","medio"],["Urbano","alto"]]' },
          { key:"tasavictfatales2017", title : "Tasa de mortalidad **", icon : "icono-arg-lazo-lineal" , description : 'Víctimas fatales cada 100.000 habitantes' , ranges : '[[12.2,"bajo"],[24.3,"medio"],[100.0,"alto"]]' }
        ];
      }

    }
  
