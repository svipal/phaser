/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var Class = require('../../utils/Class');
var DegToRad = require('../../math/DegToRad');
var Matrix4 = require('../../math/Matrix4');
var Vector3 = require('../../math/Vector3');
var Vector4 = require('../../math/Vector4');

/**
 * @classdesc
 * The Mesh Camera.
 *
 * @class MeshCamera
 * @memberof Phaser.GameObjects
 * @constructor
 * @since 3.50.0
 */
var MeshCamera = new Class({

    initialize:

    function MeshCamera (fov, x, y, z, near, far)
    {
        this.dirty = true;
        this.aspectRatio = 1;

        this._fov = fov;
        this._near = near;
        this._far = far;

        this.position = new Vector3();
        this.rotation = new Vector3();

        this.forward = new Vector4();
        this.up = new Vector4(); //  What the up direction is, invert to get bottom
        this.right = new Vector4();	//  What the right direction is, invert to get left

        this.matrix = new Matrix4(); // the transform matrix
        this.viewMatrix = new Matrix4(); // the inverse of the transform matrix
        this.projectionMatrix = new Matrix4(); // perspective projection matrix
        this.viewProjectionMatrix = new Matrix4(); // perspective projection matrix multiplied by the view matrix

        this.mode = MeshCamera.MODE_ORBIT;
    },

    panX: function (v)
    {
        this.updateViewMatrix();

        this.position.addScale(this.right, v);
    },

    panY: function (v)
    {
        this.updateViewMatrix();

        this.position.y += this.up.y * v;

        if (this.mode === MeshCamera.MODE_ORBIT)
        {
            //  Can only move up and down the y axix in orbit mode
            return;
        }

        this.position.x += this.up.x * v;
        this.position.z += this.up.z * v;
    },

    panZ: function (v)
    {
        this.updateViewMatrix();

        if (this.mode === MeshCamera.MODE_ORBIT)
        {
            //  orbit mode does translate after rotate, so only need to set Z, the rotate will handle the rest.
            this.position.z += v;
        }
        else
        {
            //  In freemode to move forward, we need to move based on our forward which is relative to our current rotation
            this.position.addScale(this.forward, v);
        }
    },

    //  To have different modes of movements, this function handles the view matrix update for the transform object.
    updateViewMatrix: function ()
    {
        var matView = this.matrix;

        if (this.mode === MeshCamera.MODE_FREE)
        {
            matView.fromRotationXYTranslation(this.rotation, this.position, true);
        }
        else
        {
            matView.fromRotationXYTranslation(this.rotation, this.position, false);
        }

        this.updateDirection();

        this.viewMatrix.copy(matView).invert();

        this.dirty = true;
    },

    update: function (width, height)
    {
        this.aspectRatio = width / height;

        //  TODO - Only needs changing when the fov/etc does
        this.projectionMatrix.perspective(DegToRad(this._fov), this.aspectRatio, this._near, this._far);

        //  TODO - Only needs calculating when this camera is dirty
        this.projectionMatrix.multiplyToMat4(this.viewMatrix, this.viewProjectionMatrix);
    },

    updateDirection: function ()
    {
        var matView = this.matrix;

        this.forward.set(0, 0, 1, 0).transformMat4(matView);
        this.up.set(0, 1, 0, 0).transformMat4(matView);
        this.right.set(1, 0, 0, 0).transformMat4(matView);
    },
    fov: {

        get: function ()
        {
            return this._fov;
        },

        set: function (value)
        {
            if (value > 0 && value < 180)
            {
                this._fov = value;
                this.dirty = true;
            }
        }

    },

    near: {

        get: function ()
        {
            return this._near;
        },

        set: function (value)
        {
            if (value > 0)
            {
                this._near = value;
                this.dirty = true;
            }
        }

    },

    far: {

        get: function ()
        {
            return this._far;
        },

        set: function (value)
        {
            if (value > 0)
            {
                this._far = value;
                this.dirty = true;
            }
        }

    },

    x: {

        get: function ()
        {
            return this.position.x;
        },

        set: function (value)
        {
            this.position.x = value;
            this.updateViewMatrix();
        }

    },

    y: {

        get: function ()
        {
            return this.position.y;
        },

        set: function (value)
        {
            this.position.y = value;
            this.updateViewMatrix();
        }

    },

    z: {

        get: function ()
        {
            return this.position.z;
        },

        set: function (value)
        {
            this.position.z = value;
            this.updateViewMatrix();
        }

    },

    rotationX: {

        get: function ()
        {
            return this.rotation.x;
        },

        set: function (value)
        {
            this.rotation.x = value;
            this.updateViewMatrix();
        }

    },

    rotationY: {

        get: function ()
        {
            return this.rotation.y;
        },

        set: function (value)
        {
            this.rotation.y = value;
            this.updateViewMatrix();
        }

    },

    rotationZ: {

        get: function ()
        {
            return this.rotation.z;
        },

        set: function (value)
        {
            this.rotation.z = value;
            this.updateViewMatrix();
        }

    },

    destroy: function ()
    {
        //  TODO - Needed?
    }

});

// Allows free movement of position and rotation
MeshCamera.MODE_FREE = 0;

// Movement is locked to rotate around the origin
MeshCamera.MODE_ORBIT = 1;

module.exports = MeshCamera;
