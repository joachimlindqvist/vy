module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),

    coffee: {
      coffee_to_js: {
        options: {
          bare: true,
          sourceMap: true
        },
        expand: true,
        flatten: true,
        cwd: "src",
        src: ["**/*.js.coffee"],
        dest: 'dist',
        ext: ".js"
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('default', ['coffee', 'uglify']);

};