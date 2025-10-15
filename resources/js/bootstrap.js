import axios from 'axios';
import axios from "axios";
import sort from "@alpinejs/sort";

window.Alpine = Alpine;
window.axios = axios;

Alpine.plugin(sort);

axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
