import Vision from '../src/index'

var html = `<div vi-class="className + 'aaa'" *click="changeName" class="hahaha">
                <input type="text" *input="onClassNameChange" vi-value="className">
                {{className}}
                <textarea name="" id="" cols="30" rows="10"></textarea>
                <br><br><br>
                <span>{{num}}{{person.name}}</span>
                    my name is{{name}}
                <test *nameChange="onNameChange"></test>
            </div>`


const app: HTMLElement = document.getElementById("app")

const vision = new Vision({
    template: html,
    data() {
        return {
            className: "city",
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
                    template: "<div style='color: red' >{{date}}</div>",
                    data() {
                        return {
                            date: new Date().toLocaleTimeString(),
                            person: {}
                        }
                    },
                    mounted() {
                        console.log("time mounted")
                        // setInterval(() => {
                        //     this.date = new Date().toLocaleTimeString();
                        //     this.person.name = Math.floor(Math.random() * 10)
                        // }, 300)
                    }
                }
            },
            methods: {
                doOthers() {

                },
                changeTestName() {
                    console.log(this);
                    this.testName = "i am new Test Name";
                    this.$emit('nameChange', this.testName)
                },
            },
            mounted() {
                console.log("test mounted")
            }
        },
    },
    methods: {
        onNameChange(newName: string) {
            console.log(newName)
        },
        changeName() {
            this.person = { name: '---------changed person--------' };
            setTimeout(() => {
                this.person = { name: "---------changed person again!--------" }
                this.person.name = ".....reset name....."
                setTimeout(() => {
                    this.person.name = "-----final name-----"
                })
            }, 3000)
        },
        onClassNameChange(event: Event) {
            this.className = (<HTMLInputElement>event.target).value;
        }
    },
    mounted() {
        console.log("root mounted")
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

