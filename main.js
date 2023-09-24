class Paint {
  startBackgroundColor = "white";
  drawColor = "black";
  drawWidth = "2";
  isDrawing = false;
  drawingType = "Pędzel";
  copyOfCanvas;
  startCoordsShape;
  fill = false;
  proporcja = false;
  restoreArray = [];
  index = -1;
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  buttons = document.getElementsByClassName("drawTypeButton");
  colorButtons = document.getElementsByClassName("colorButton");
  checkboxes = document.getElementsByClassName("checkbox");
  bounds;

  constructor() {
    this.canvas.width = window.innerWidth - 60;
    this.canvas.height = 400;

    Array.from(this.checkboxes).forEach((button) => {
      button.checked = false;
    });

    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.canvas.addEventListener("touchstart", this.start, false);
    this.canvas.addEventListener("touchmove", this.draw, false);
    this.canvas.addEventListener("touchend", this.stop, false);

    this.canvas.addEventListener("mousedown", this.start, false);
    this.canvas.addEventListener("mousemove", this.draw, false);
    this.canvas.addEventListener("mouseup", this.stop, false);
    
    this.canvas.addEventListener("mouseout", this.stop, false);

    this.bounds = this.canvas.getBoundingClientRect();

    window.addEventListener("scroll",  () => {
      this.bounds = this.canvas.getBoundingClientRect();
    });

    window.addEventListener("resize", () => {
      this.bounds = this.canvas.getBoundingClientRect();
    });
  }

  changeColor = (element) => {
    this.drawColor = element.style.background;

    Array.from(this.colorButtons).forEach((button) => {
      button.style.borderColor = "white";

      if (button.style.background === this.drawColor) {
        button.style.borderColor = "black";
      }
    });
  };

  changeDrawingType = (element) => {
    this.drawingType = element.textContent.trim();
    Array.from(this.buttons).forEach((button) => {
      button.style.background = "#222";
      button.style.color = "white";

      if (button.textContent.trim() === this.drawingType) {
        button.style.background = "white";
        button.style.color = "black";
      }
    });
  };

  start = (event) => {
    this.isDrawing = true;
    const res = this.getXY(event);

    if (this.drawingType == "Pędzel") {
      this.context.beginPath();
      this.context.moveTo(res.x, res.y);
      event.preventDefault();
    } else {
      this.copyOfCanvas = this.context.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.startCoordsShape = { x: res.x, y: res.y };
    }
  };

  draw = (event) => {
    if (this.isDrawing) {
      const res = this.getXY(event);

      this.context.strokeStyle = this.drawColor;
      this.context.lineWidth = this.drawWidth;

      if (this.drawingType == "Pędzel") {
        this.context.lineTo(res.x, res.y);
        this.context.lineCap = "round";
        this.context.lineJoin = "round";
      } else if (this.drawingType == "Prostokąt") {
        this.context.putImageData(this.copyOfCanvas, 0, 0);
        this.context.beginPath();

        let width = res.x - this.startCoordsShape.x;
        let height = res.y - this.startCoordsShape.y;

        if (this.proporcja) {
          if (width > 0 && height > 0 && width > height) width = height;
          else if (width > 0 && height > 0 && width < height) height = width;
          else if (width < 0 && height < 0 && width < height) width = height;
          else if (width < 0 && height < 0 && width > height) height = width;
          else if (Math.abs(width) > Math.abs(height)) width = -height;
          else if (Math.abs(width) < Math.abs(height)) height = -width;
        }
        this.context.rect(
          this.startCoordsShape.x,
          this.startCoordsShape.y,
          width,
          height
        );
      } else if (this.drawingType == "Linia") {
        this.context.putImageData(this.copyOfCanvas, 0, 0);
        this.context.beginPath();
        this.context.moveTo(this.startCoordsShape.x, this.startCoordsShape.y);

        if (this.proporcja) {
          if (
            Math.abs(this.startCoordsShape.x - res.x) <
            Math.abs(this.startCoordsShape.y - res.y)
          )
            res.x = this.startCoordsShape.x;
          else res.y = this.startCoordsShape.y;
        }

        this.context.lineTo(res.x, res.y);
      } else if (this.drawingType == "Elipsa") {
        this.context.beginPath();
        this.context.putImageData(this.copyOfCanvas, 0, 0);

        let width = res.x - this.startCoordsShape.x;
        let height = res.y - this.startCoordsShape.y;

        if (this.proporcja) {
          if (width > 0 && height > 0 && width > height) width = height;
          else if (width > 0 && height > 0 && width < height) height = width;
          else if (width < 0 && height < 0 && width < height) width = height;
          else if (width < 0 && height < 0 && width > height) height = width;
          else if (Math.abs(width) > Math.abs(height)) width = -height;
          else if (Math.abs(width) < Math.abs(height)) height = -width;
        }

        let startX, startY;

        if (width < 0) {
          width = Math.abs(width);
          startX = this.startCoordsShape.x - width / 2;
        } else {
          startX = this.startCoordsShape.x + width / 2;
        }

        if (height < 0) {
          height = Math.abs(height);
          startY = this.startCoordsShape.y - height / 2;
        } else {
          startY = this.startCoordsShape.y + height / 2;
        }

        this.context.ellipse(
          startX,
          startY,
          width / 2,
          height / 2,
          0,
          0,
          2 * Math.PI
        );
      }
      if (this.fill) {
        this.context.fillStyle = this.drawColor;
        this.context.fill();
      }
      this.context.stroke();
    }

    event.preventDefault();
  };

  getXY = (event) => {
    let x = event.pageX - this.bounds.left - scrollX;
    let y = event.pageY - this.bounds.top - scrollY;

    x /= this.bounds.width;
    y /= this.bounds.height;

    x *= this.canvas.width;
    y *= this.canvas.height;

    return { x: x, y: y };
  };

  stop = (event) => {
    if (this.isDrawing) {
      this.context.stroke();
      this.context.closePath();
      this.isDrawing = false;
    }

    event.preventDefault();

    if (event.type != "mouseout") {
      this.restoreArray.push(
        this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
      this.index++;
    }
  };

  clearCanvas = () => {
    this.context.fillStyle = this.startBackgroundColor;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };

  downloadImage = () => {
    let link = document.createElement("a");
    link.setAttribute("download", "Canvas.png");
    link.setAttribute(
      "href",
      this.canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")
    );
    link.click();
  };

  undoLast = () => {
    if (this.index <= 0) {
      this.clearCanvas();
    } else {
      this.index--;
      this.restoreArray.pop();
      this.context.putImageData(this.restoreArray[this.index], 0, 0);
    }
  };
}

const paint = new Paint();
