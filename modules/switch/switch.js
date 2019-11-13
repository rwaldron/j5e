/**
 * Switch module - For controlling switches
 * @module j5e/switch
 */

import { Emitter } from "../util/event.js";
import {normalizeParams, getProvider} from "../util/fn.js";


// TODO: Research "Normally Open" vs "Sink Drive"
/** 
 * Class representing a switch
 * @classdesc The Switch class allows for control of digital switches
 * @extends Emitter
 * @fires Switch#open
 * @fires Switch#close
 */
class Switch extends Emitter {
  
  #state = {
    normallyOpen: true,
    raw: null 
  };

  /**
   * Instantiate a switch
   * @param {(number|string|object)} io - A pin number, pin identifier or a complete IO options object
   * @param {(number|string)} [io.pin] - If passing an object, a pin number or pin identifier
   * @param {(string|constructor)} [io.io=builtin/digital] - If passing an object, a string specifying a path to the IO provider or a constructor
   * @param {object} [device={}] - An object containing device options
   */
  constructor(io, device) { 
    return (async () => {
      const {ioOpts, deviceOpts} = normalizeParams(io, device);
      super();

      const Provider = await getProvider(ioOpts, "builtin/digital");
      this.io = new Provider({
        pin: ioOpts.pin,
        mode: Provider.Input,
        edge: Provider.Rising | Provider.Falling,
        onReadable: () => { this.emit(this.isOpen ? "open" : "close") }
      });

      // Is this instance Normally Open
      this.#state.normallyOpen = deviceOpts.type !== "NC";

      Object.defineProperties(this, {
        isClosed: {
          get: () => {
            return !this.io.read();
          }
        },
        isOpen: {
          get: () => {
            return this.io.read();
          }
        }
      });
      
      return this;
    })();
    
    
  }

}

export default Switch;