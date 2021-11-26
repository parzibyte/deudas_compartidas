import { initializeApp } from "firebase/app";
import { ref } from "firebase/database";
import { getFirestore, collection, getDocs, enableIndexedDbPersistence } from "firebase/firestore";
import { ToastProgrammatic as Toast } from 'buefy'
let modoSinConexionActivado = false;
const CLAVE_LOCALSTORAGE_USUARIO = "usuario_autenticado";
const BaseDeDatosService = {
	guardarUsuarioAutenticado(usuario) {
		localStorage.setItem(CLAVE_LOCALSTORAGE_USUARIO, JSON.stringify(usuario));
	},
	obtenerUsuarioAutenticado() {
		return JSON.parse(localStorage.getItem(CLAVE_LOCALSTORAGE_USUARIO));
	},
	obtener: async () => {
		const firebaseConfig = {
			apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
			authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
			databaseURL: process.env.VUE_APP_FIREBASE_DATABASE_URL,
			projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
			storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
			appId: process.env.VUE_APP_FIREBASE_APP_ID,
		};
		const app = initializeApp(firebaseConfig);
		const bd = getFirestore(app);
		if (modoSinConexionActivado) {
			return bd;
		}
		try {
			await enableIndexedDbPersistence(bd);
			Toast.open({
				message: "Modo fuera de línea habilitado correctamente",
				type: "is-success",
			});
			modoSinConexionActivado = true;
		} catch (err) {
			console.log({ err });
			let mensaje = "";
			if (err.code == "failed-precondition") {
				mensaje =
					"Error: recuerda no tener varias pestañas abiertas con la app";
			} else if (err.code == "unimplemented") {
				mensaje =
					"Error: el navegador que usas no soporta el modo fuera de línea. Cambia de navegador";
			}
			mensaje += " " + err.toString();
			Toast.open({
				message: mensaje,
				type: "is-danger",
			});
		}
		return bd;
	},
	obtenerColeccionUsuarios: async () => {
		return collection(
			await BaseDeDatosService.obtener(),
			"usuarios"
		);
	},
	async obtenerUsuarios() {
		return await getDocs(await BaseDeDatosService.obtenerColeccionUsuarios());
	},
	obtenerColeccionDeudas: async () => {
		return collection(
			await BaseDeDatosService.obtener(),
			"deudas"
		);
	},
	obtenerReferenciaListaUsuarios: async () => {
		return ref(
			await BaseDeDatosService.obtener(),
			"usuarios"
		);
	},
	obtenerReferenciaListaDeudas: async () => {
		return ref(
			await BaseDeDatosService.obtener(),
			"deudas"
		);
	},
};
export default BaseDeDatosService;