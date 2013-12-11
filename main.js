
var LARGEUR_PAGE = 535;
var HAUTEUR_PAGE = 800;

var ctrl = false;
var shift = false;
var niveauCurseur = 1;

var COULEURS = [
	[0,0,0,0], //vide
	[0,0,255,255],
	[0,255,0,255],
	[255,0,0,255],
	[0,255,255,255],
	[255,0,255,255],
	[255,150,0,255],
	[150,150,150,255],
	[0,0,150,255],
	[0,150,0,255],
	[150,0,0,255],
	[0,150,150,255],
	[150,0,150,255],
	[150,150,0,255],
];

var afficheurNiveau = document.getElementById('niveau');

var baliseCanvas = document.createElement('canvas');
baliseCanvas.width = LARGEUR_PAGE;
baliseCanvas.height = HAUTEUR_PAGE;
baliseCanvas.id = 'canvasPage';
document.body.appendChild(baliseCanvas);
var controleurCanvas = baliseCanvas.getContext("2d");

var Page = function (){
	this.hauteur=HAUTEUR_PAGE;
	this.largeur=LARGEUR_PAGE;
	this.carteDecoupe=[];
	for (var x = 0; x<this.largeur;x++){
		this.carteDecoupe[x] = [];
		for (var y = 0; y<this.hauteur;y++){
			this.carteDecoupe[x][y]=0;
		}
	}
};
var decoupeActuelle = new Page();
var instantanéePage = new Page();


function affichage(page){
	var imageDataPage = controleurCanvas.createImageData(page.largeur,page.hauteur);
	for (var y = 0; y<page.hauteur;y++){
		for (var x = 0; x<page.largeur;x++){
			var curseur = 4*(x+y*page.largeur);
			imageDataPage.data[curseur]   = COULEURS[page.carteDecoupe[x][y]][0];
			imageDataPage.data[curseur+1] = COULEURS[page.carteDecoupe[x][y]][1];
			imageDataPage.data[curseur+2] = COULEURS[page.carteDecoupe[x][y]][2];
			imageDataPage.data[curseur+3] = COULEURS[page.carteDecoupe[x][y]][3];
		}
	}
	controleurCanvas.putImageData( imageDataPage, 0 , 0 );
}


document.addEventListener('keydown',function(e){
	shift = e.shiftKey;
	ctrl = e.ctrlKey;
},false);
document.addEventListener('keyup',function(e){
	shift = e.shiftKey;
	ctrl = e.ctrlKey;
},false);

document.addEventListener('mousemove',function(e){
	// à remplacer par un curseur personnalisé pour chaque niveau pour éliminer toutes latence
	afficheurNiveau.innerHTML = niveauCurseur;
	afficheurNiveau.style.left = e.clientX+10 +'px';
	afficheurNiveau.style.top = e.clientY+20 +'px';
	if(e.clientX>=LARGEUR_PAGE || e.clientY>=HAUTEUR_PAGE) afficheurNiveau.style.display = 'none';
	else afficheurNiveau.style.display = 'block';
},false);

baliseCanvas.addEventListener('mousemove',mousemove,false);
function mousemove(e){
	var nivLigne = getNiveauLigne(e.clientX,e.clientY);
	instantanéePage = clone(decoupeActuelle);
	ajouterLigne(instantanéePage,e.clientX,e.clientY,nivLigne);
	affichage(instantanéePage);
}

baliseCanvas.addEventListener('mouseup',function(e){
	var nivLigne = getNiveauLigne(e.clientX,e.clientY);
	ajouterLigne(decoupeActuelle,e.clientX,e.clientY,nivLigne);
	affichage(decoupeActuelle);
},false);

baliseCanvas.addEventListener('wheel',function(e){
	if(shift){
		console.log(e);
		if(e.deltaY<0 || e.deltaX<0) niveauCurseur = Math.max(1,niveauCurseur-1);
		else niveauCurseur = Math.min(COULEURS.length-1,niveauCurseur+1);
		afficheurNiveau.innerHTML = niveauCurseur;
		mousemove(e);
	}
	e.preventDefault();
	return false;
},false);

function getNiveauLigne(originX,originY){
	if(shift){
		return niveauCurseur;
	} else {
		page = decoupeActuelle;
		niv = 0;
		if(ctrl){
			x = originX;
			yMoins = originY;
			yPlus = originY;
			while(yMoins>=0 || yPlus<page.hauteur){
				if(yMoins>=0){
					valeurPoint = page.carteDecoupe[x][yMoins];
					if (valeurPoint!=0){
						niv = Math.max(niv, valeurPoint+1);
						yMoins= -1;
					}
					yMoins--;
				}
				if(yPlus<page.hauteur){
					valeurPoint = page.carteDecoupe[x][yPlus];
					if (valeurPoint!=0){
						niv = Math.max(niv, valeurPoint+1);
						yPlus= page.hauteur;
					}
					yPlus++;
				}
			}
		} else {
			xMoins = originX;
			xPlus = originX;
			y = originY;
			while(xMoins>=0 || xPlus<page.largeur){
				if(xMoins>=0){
					valeurPoint = page.carteDecoupe[xMoins][y];
					if (valeurPoint!=0){
						niv = Math.max(niv, valeurPoint+1);
						xMoins= -1;
					}
					xMoins--;
				}
				if(xPlus<page.largeur){
					valeurPoint = page.carteDecoupe[xPlus][y];
					if (valeurPoint!=0){
						niv = Math.max(niv, valeurPoint+1);
						xPlus= page.largeur;
					}
					xPlus++;
				}
			}
		}
		return niveauCurseur = Math.max(1,niv);
	}
}
function ajouterLigne(page,originX,originY,niv){
	if(ctrl){
		x = originX;
		yMoins = originY;
		yPlus = originY;
		while(yMoins>=0 || yPlus<page.hauteur){
			if(yMoins>=0){
				valeurPoint = page.carteDecoupe[x][yMoins];
				if (valeurPoint!=0 && valeurPoint<niv){
					yMoins= -1;
				} else {
					page.carteDecoupe[x-1][yMoins]=niv;
					page.carteDecoupe[x][yMoins]=niv;
					page.carteDecoupe[x+1][yMoins]=niv;
				}
				yMoins--;
			}
			if(yPlus<page.hauteur){
				valeurPoint = page.carteDecoupe[x][yPlus];
				if (valeurPoint!=0 && valeurPoint<niv){
					yPlus= page.hauteur;
				} else {
					page.carteDecoupe[x-1][yPlus]=niv;
					page.carteDecoupe[x][yPlus]=niv;
					page.carteDecoupe[x+1][yPlus]=niv;
				}
				yPlus++;
			}
		}
	} else {
		xMoins = originX;
		xPlus = originX;
		y = originY;
		while(xMoins>=0 || xPlus<page.largeur){
			if(xMoins>=0){
				valeurPoint = page.carteDecoupe[xMoins][y];
				if (valeurPoint!=0 && valeurPoint<niv){
					xMoins= -1;
				} else {
					page.carteDecoupe[xMoins][y-1]=niv;
					page.carteDecoupe[xMoins][y]=niv;
					page.carteDecoupe[xMoins][y+1]=niv;
				}
				xMoins--;
			}
			if(xPlus<page.largeur){
				valeurPoint = page.carteDecoupe[xPlus][y];
				if (valeurPoint!=0 && valeurPoint<niv){
					xPlus= page.largeur;
				} else {
					page.carteDecoupe[xPlus][y-1]=niv;
					page.carteDecoupe[xPlus][y]=niv;
					page.carteDecoupe[xPlus][y+1]=niv;
				}
				xPlus++;
			}
		}
	}
}

function clone(structure){
	return JSON.parse(JSON.stringify(structure))
}
