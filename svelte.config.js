import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      out: 'build'
    }),
    paths: {
      base: '/geolocator'
    }
  }
};
