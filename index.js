const fs = require('fs')
const program = require('commander')
const chalk = require('chalk')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const symbols = require('log-symbols')
const handlebars = require('handlebars')

program
  .version(require('./package').version, '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt([
        {
          name: 'templateType',
          message: 'which template type you need to create?',
          type: 'list',
          choices: ['webpack', 'rollup'],
        },
        {
          name: 'description',
          message: 'Entry description of project: '
        },
        {
          name: 'author',
          message: 'Entry author name: ',
        }
      ]).then((answers) => {
        console.log(answers)
        const spinner = ora(`downloading ${answers.templateType} template...`)
        spinner.start()
        const downloadPath = `direct:https://github.com/ruaya/${answers.templateType}-template.git#master`
        download(downloadPath,
          name, { clone: true }, (err) => {
            if (err) {
              spinner.fail()
              console.error(symbols.error,
                chalk.red(`${err}download template fail,please check your network connection and try again`))
              process.exit(1)
            }
            spinner.succeed()
            const meta = {
              name,
              description: answers.description,
              author: answers.author,
            }
            const fileName = `${name}/package.json`
            const content = fs.readFileSync(fileName).toString()
            const result = handlebars.compile(content)(meta)
            fs.writeFileSync(fileName, result)
          })
      })
    } else {
      console.error(symbols.error, chalk.red('project had exist'))
    }
  })
  .on('--help', () => {
    console.log('How to use ruaya-repo-cli?')
    console.log('ruaya-repo-cli init webpack or rollup')
    console.log()
  })

program.parse(process.argv)