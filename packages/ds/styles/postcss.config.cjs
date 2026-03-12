module.exports = ({ env }) => ({
  plugins: {
    "postcss-import": {},
    ...(env === "production" ? { cssnano: {} } : {}),
  },
});
