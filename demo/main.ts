import Vision from '../src/index'

var html = `<div *click="changeName" class="hahaha">
            <input type="text">
            <textarea name="" id="" cols="30" rows="10"></textarea>
            <br><br><br>
            <span>{{num}}{{person.name}}</span>
                my name is{{name}}
            <test></test>
            </div>`


const app: HTMLElement = document.getElementById("app")

const vision = new Vision({
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
                            time.now 
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
                    template: "<div style='color: red'>{{date}}</div>",
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
                },
            },
        },
    },
    methods: {
        changeName() {
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
