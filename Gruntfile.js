module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '**/*.html',
                    dest: 'dist'
                }]
            }
        },

        cssmin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: '**/*.css',
                    dest: 'dist',
                    extension: '.css'
                }]
            }
        },

        autoprefixer: {
			build: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: '**/*.css',
					dest: 'dist/'
				}]
			}
		},

        uglify: {
            build: {
                options: {
                    compress: true,
                    sourceMap: false,
                    output: {
                        comments: false
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'src/js/',
                        src: '**/*.js',
                        dest: 'dist/js/'
                    }
                ]
            }

        }
    });
  
    // Loading plugins
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');

    grunt.registerTask('build', [
        'newer:htmlmin:build',
        'newer:cssmin:build',
        'newer:autoprefixer:build',
        'newer:uglify:build'
    ]);
};