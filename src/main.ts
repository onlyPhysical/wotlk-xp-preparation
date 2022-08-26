import { createApp } from "vue";
import App from "./App.vue";

import VueTippy from "vue-tippy";
import "tippy.js/dist/tippy.css";

const app = createApp(App).use(
    VueTippy,
    // optional
    {
      directive: 'tippy', // => v-tippy
      component: 'tippy', // => <tippy/>
      componentSingleton: 'tippy-singleton', // => <tippy-singleton/>,
      defaultProps: {
        placement: 'top',
        allowHTML: true,
        arrow: false
      }, // => Global default options * see all props
    }
  )

app.mount("#app");
