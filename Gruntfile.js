module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('bower.json'),

    coffee: {
      coffee_to_js: {
        options: {
          bare: false,
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
    },

    connect: {
        server: {
          options: {
            port: 8000,
            hostname: '*',
            keepalive: true
          }
        }
    },

    sass: {
        dist: {
            files: [{
                expand: true,
                cwd: 'src',
                src: ['**/*.scss'],
                dest: 'dist',
                ext: '.css'
            }]
        }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', ['coffee', 'sass', 'uglify']);

};