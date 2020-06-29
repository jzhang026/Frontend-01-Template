function Heap(arr /*Array<number>*/, comparator /* (a,b) => boolean */) {
  if (typeof comparator !== 'function')
    throw new Error('comparator must be a function');
  this.data = [null].concat(arr.filter((ele) => typeof ele === 'number'));
  this.dataCount = this.data.length - 1;
  this.comparator = comparator;
  this.buildHeap();
}

Heap.prototype.buildHeap = function () {
  for (let i = this.dataCount >> 1; i >= 1; --i) {
    Heap.heapify(this.data, this.dataCount, i, this.comparator);
  }
};
Heap.heapify = function (arr, n, i, comparator) {
  while (true) {
    let maxPos = i;
    if (i * 2 <= n && comparator(arr[i], arr[i * 2]) < 0) maxPos = i * 2;
    if (i * 2 + 1 <= n && comparator(arr[maxPos], arr[i * 2 + 1]) < 0)
      maxPos = i * 2 + 1;
    if (maxPos == i) break;
    Heap.swap(arr, i, maxPos);
    i = maxPos;
  }
};

Heap.prototype.insert = function (data) {
  this.data[++this.dataCount] = data;
  let i = this.dataCount;
  while (i >> 1 > 0 && this.comparator(this.data[i], this.data[i >> 1]) > 0) {
    Heap.swap(this.data, i, i >> 1);
    i = i >> 1;
  }
};

Heap.prototype.removeRoot = function () {
  if (this.dataCount < 1) return undefined;
  let root = this.data[1];
  this.data[1] = this.data[this.dataCount--];
  Heap.heapify(this.data, this.dataCount, 1, this.comparator);
  this.data = this.data.slice(0, this.dataCount + 1);
  return root;
};

Heap.swap = function (arr, i, j) {
  let temp = arr[j];
  arr[j] = arr[i];
  arr[i] = temp;
};
