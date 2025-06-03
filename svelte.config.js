import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      out: 'dist'
    }),
    paths: {
      base: '/geolocator'
    }
  }
};
