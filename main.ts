import Vision from './src/index'

var html = `<div *click="changeName" class='hahaha'>
            <span>{{num}}{{person.name}}</span>
                my name is{{name}}
            <test></test>
            </div>`


const app: HTMLElement = document.getElementById("app")

const vision = new Vision(app, {
    template: html,
    data() {
        return {
            name: 'zzp',
            num: 15,
            person: { name: 'ehahah', diss: { a: 1 } }
        }
    },
    components: {
        test: {
            template: `<span *click='changeTestName'>
                            <time></time>
                            {{"hahaha"}} 
                            {{testName}}
                        </span>`,
            data() {
                return {
                    testName: 'i am test'
                }
            },
            components: {
                time: {
                    template: "<div style='color: red'>time.now {{date}} {{person.name}} lalala</div>",
                    data() {
                        return {
                            date: new Date().toLocaleTimeString(),
                            person: {}
                        }
                    },
                    mounted() {
                        setInterval(() => {
                            this.date = new Date().toLocaleTimeString();
                            this.person.name = Math.floor(Math.random() * 10)
                        }, 300)
                    }
                }
            },
            methods: {
                changeTestName() {
                    this.testName = "i changed testName"
                },
            },
        },
    },
    methods: {
        changeName() {
            this.name = Math.random() + 12;
        }
    }
});

vision.$mount(app);

let win = window as any;

win.vision = vision;

console.log(vision)


// function getRandomStr(count: number): string {
//     let str = "";
//     for (let i = 0; i < count; i++) {
//         let randomCharCode = Math.floor(97 + Math.random() * (122 - 97));
//         str += String.fromCharCode(randomCharCode);
//     }

//     return str;
// }

// document.onclick = function () {
//     let vnode: Vnode = cloneVnode(newVnode);
//     vnode.children.sort(() => -1 + Math.random() * 2);

//     for (let item of vnode.children) {
//         const attrs = item.attrs;
//         for (let i = 0; i < 3; i++) {
//             const key = getRandomStr(4);
//             const value = getRandomStr(2);
//             attrs[key] = value;
//         }
//     }
//     vnode.children.length = Math.floor(1 + Math.random() * 3)
//     vision.update(vnode);
// }

