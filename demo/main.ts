import Vision from '../src/index'

var html = `<div>
                <h3>event binding</h3>
                <input type="text" *input="onClassNameChange" vi-value="className">{{className}}
                <h3>vi-for directive</h3>
                <p vi-key="name" vi-for="(name, index) in names">{{index}}、  vi-for name is {{name}}</p>
                <h3>dynamic Text binding</h3>
                dynamic name is {{name}}
                <h3>vi-if directive</h3>
                <p vi-if="showTest">i am the test Text for vi-if!</p>
                <p><button *click="toggleTest">ToggleTest</button></p>
               <h3>child Component</h3>
               <test></test>
               <h3>component event</h3>
               <time *timechanged="onTimeChanged"></time>
               <span>Time: {{time}}</span>
            </div>`


const app: HTMLElement = document.getElementById("app")
const names = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];
const vision = new Vision({
    template: html,
    data() {
        return {
            showTest: true,
            className: "city",
            name: 'zzp',
            num: 15,
            person: { name: 'ehahah', diss: { a: 1 } },
            names,
            time: "",
        }
    },
    components: {
        time: {
            template: "<div style='color: red' ></div>",
            data() {
                return {
                    date: new Date().toLocaleTimeString(),
                    person: {}
                }
            },
            mounted() {
                // setInterval(() => {
                //     this.$emit('timechanged', new Date().toLocaleTimeString());
                // }, 300)
            },
            destroyed() {
                console.log('time Destroyed')
            }
        },
        test: {
            template: `<p>
                            i am a child component!
                        </p>`,
            data() {
                return {
                    testName: 'i am test'
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
                this.$on('nameChange', () => {
                    console.log('test component emit event "nameChange"')
                })
                console.log("test mounted")
            },
            destroyed() {
                console.log('test Destroyed')
            }
        },
    },
    methods: {
        onTimeChanged(newTime: string) {
            this.time = newTime;
        },
        shuffleNames() {
            this.names.sort(() => -1 + Math.random() * 2);
        },
        toggleTest() {
            this.showTest = !this.showTest;
        },
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
        setInterval(() => {
            let random = 3 + Math.floor((Math.random() * names.length - 3));
            this.names = names.slice(random)
        }, 3000)
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

