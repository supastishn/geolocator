import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      pages: 'dist',
      assets: 'dist',
      out: 'dist'
    }),
    paths: {
      base: '/geolocator'
    }
  }
};
