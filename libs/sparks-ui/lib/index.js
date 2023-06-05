'use strict';

function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e))for(t=0;t<e.length;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f);else for(t in e)e[t]&&(n&&(n+=" "),n+=t);return n}function clsx(){for(var e,t,f=0,n="";f<arguments.length;)(e=arguments[f++])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}

/**
 * The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
 *
 * Specifically:
 * - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
 * - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
 *
 * Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
 */
function twJoin() {
  var index = 0;
  var argument;
  var resolvedValue;
  var string = '';
  while (index < arguments.length) {
    if (argument = arguments[index++]) {
      if (resolvedValue = toValue(argument)) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}
function toValue(mix) {
  if (typeof mix === 'string') {
    return mix;
  }
  var resolvedValue;
  var string = '';
  for (var k = 0; k < mix.length; k++) {
    if (mix[k]) {
      if (resolvedValue = toValue(mix[k])) {
        string && (string += ' ');
        string += resolvedValue;
      }
    }
  }
  return string;
}

var CLASS_PART_SEPARATOR = '-';
function createClassUtils(config) {
  var classMap = createClassMap(config);
  var conflictingClassGroups = config.conflictingClassGroups,
    _config$conflictingCl = config.conflictingClassGroupModifiers,
    conflictingClassGroupModifiers = _config$conflictingCl === void 0 ? {} : _config$conflictingCl;
  function getClassGroupId(className) {
    var classParts = className.split(CLASS_PART_SEPARATOR);
    // Classes like `-inset-1` produce an empty string as first classPart. We assume that classes for negative values are used correctly and remove it from classParts.
    if (classParts[0] === '' && classParts.length !== 1) {
      classParts.shift();
    }
    return getGroupRecursive(classParts, classMap) || getGroupIdForArbitraryProperty(className);
  }
  function getConflictingClassGroupIds(classGroupId, hasPostfixModifier) {
    var conflicts = conflictingClassGroups[classGroupId] || [];
    if (hasPostfixModifier && conflictingClassGroupModifiers[classGroupId]) {
      return [].concat(conflicts, conflictingClassGroupModifiers[classGroupId]);
    }
    return conflicts;
  }
  return {
    getClassGroupId: getClassGroupId,
    getConflictingClassGroupIds: getConflictingClassGroupIds
  };
}
function getGroupRecursive(classParts, classPartObject) {
  if (classParts.length === 0) {
    return classPartObject.classGroupId;
  }
  var currentClassPart = classParts[0];
  var nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
  var classGroupFromNextClassPart = nextClassPartObject ? getGroupRecursive(classParts.slice(1), nextClassPartObject) : undefined;
  if (classGroupFromNextClassPart) {
    return classGroupFromNextClassPart;
  }
  if (classPartObject.validators.length === 0) {
    return undefined;
  }
  var classRest = classParts.join(CLASS_PART_SEPARATOR);
  return classPartObject.validators.find(function (_ref) {
    var validator = _ref.validator;
    return validator(classRest);
  })?.classGroupId;
}
var arbitraryPropertyRegex = /^\[(.+)\]$/;
function getGroupIdForArbitraryProperty(className) {
  if (arbitraryPropertyRegex.test(className)) {
    var arbitraryPropertyClassName = arbitraryPropertyRegex.exec(className)[1];
    var property = arbitraryPropertyClassName?.substring(0, arbitraryPropertyClassName.indexOf(':'));
    if (property) {
      // I use two dots here because one dot is used as prefix for class groups in plugins
      return 'arbitrary..' + property;
    }
  }
}
/**
 * Exported for testing only
 */
function createClassMap(config) {
  var theme = config.theme,
    prefix = config.prefix;
  var classMap = {
    nextPart: new Map(),
    validators: []
  };
  var prefixedClassGroupEntries = getPrefixedClassGroupEntries(Object.entries(config.classGroups), prefix);
  prefixedClassGroupEntries.forEach(function (_ref2) {
    var classGroupId = _ref2[0],
      classGroup = _ref2[1];
    processClassesRecursively(classGroup, classMap, classGroupId, theme);
  });
  return classMap;
}
function processClassesRecursively(classGroup, classPartObject, classGroupId, theme) {
  classGroup.forEach(function (classDefinition) {
    if (typeof classDefinition === 'string') {
      var classPartObjectToEdit = classDefinition === '' ? classPartObject : getPart(classPartObject, classDefinition);
      classPartObjectToEdit.classGroupId = classGroupId;
      return;
    }
    if (typeof classDefinition === 'function') {
      if (isThemeGetter(classDefinition)) {
        processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
        return;
      }
      classPartObject.validators.push({
        validator: classDefinition,
        classGroupId: classGroupId
      });
      return;
    }
    Object.entries(classDefinition).forEach(function (_ref3) {
      var key = _ref3[0],
        classGroup = _ref3[1];
      processClassesRecursively(classGroup, getPart(classPartObject, key), classGroupId, theme);
    });
  });
}
function getPart(classPartObject, path) {
  var currentClassPartObject = classPartObject;
  path.split(CLASS_PART_SEPARATOR).forEach(function (pathPart) {
    if (!currentClassPartObject.nextPart.has(pathPart)) {
      currentClassPartObject.nextPart.set(pathPart, {
        nextPart: new Map(),
        validators: []
      });
    }
    currentClassPartObject = currentClassPartObject.nextPart.get(pathPart);
  });
  return currentClassPartObject;
}
function isThemeGetter(func) {
  return func.isThemeGetter;
}
function getPrefixedClassGroupEntries(classGroupEntries, prefix) {
  if (!prefix) {
    return classGroupEntries;
  }
  return classGroupEntries.map(function (_ref4) {
    var classGroupId = _ref4[0],
      classGroup = _ref4[1];
    var prefixedClassGroup = classGroup.map(function (classDefinition) {
      if (typeof classDefinition === 'string') {
        return prefix + classDefinition;
      }
      if (typeof classDefinition === 'object') {
        return Object.fromEntries(Object.entries(classDefinition).map(function (_ref5) {
          var key = _ref5[0],
            value = _ref5[1];
          return [prefix + key, value];
        }));
      }
      return classDefinition;
    });
    return [classGroupId, prefixedClassGroup];
  });
}

// LRU cache inspired from hashlru (https://github.com/dominictarr/hashlru/blob/v1.0.4/index.js) but object replaced with Map to improve performance
function createLruCache(maxCacheSize) {
  if (maxCacheSize < 1) {
    return {
      get: function get() {
        return undefined;
      },
      set: function set() {}
    };
  }
  var cacheSize = 0;
  var cache = new Map();
  var previousCache = new Map();
  function update(key, value) {
    cache.set(key, value);
    cacheSize++;
    if (cacheSize > maxCacheSize) {
      cacheSize = 0;
      previousCache = cache;
      cache = new Map();
    }
  }
  return {
    get: function get(key) {
      var value = cache.get(key);
      if (value !== undefined) {
        return value;
      }
      if ((value = previousCache.get(key)) !== undefined) {
        update(key, value);
        return value;
      }
    },
    set: function set(key, value) {
      if (cache.has(key)) {
        cache.set(key, value);
      } else {
        update(key, value);
      }
    }
  };
}

var IMPORTANT_MODIFIER = '!';
function createSplitModifiers(config) {
  var separator = config.separator || ':';
  var isSeparatorSingleCharacter = separator.length === 1;
  var firstSeparatorCharacter = separator[0];
  var separatorLength = separator.length;
  // splitModifiers inspired by https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
  return function splitModifiers(className) {
    var modifiers = [];
    var bracketDepth = 0;
    var modifierStart = 0;
    var postfixModifierPosition;
    for (var index = 0; index < className.length; index++) {
      var currentCharacter = className[index];
      if (bracketDepth === 0) {
        if (currentCharacter === firstSeparatorCharacter && (isSeparatorSingleCharacter || className.slice(index, index + separatorLength) === separator)) {
          modifiers.push(className.slice(modifierStart, index));
          modifierStart = index + separatorLength;
          continue;
        }
        if (currentCharacter === '/') {
          postfixModifierPosition = index;
          continue;
        }
      }
      if (currentCharacter === '[') {
        bracketDepth++;
      } else if (currentCharacter === ']') {
        bracketDepth--;
      }
    }
    var baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.substring(modifierStart);
    var hasImportantModifier = baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER);
    var baseClassName = hasImportantModifier ? baseClassNameWithImportantModifier.substring(1) : baseClassNameWithImportantModifier;
    var maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : undefined;
    return {
      modifiers: modifiers,
      hasImportantModifier: hasImportantModifier,
      baseClassName: baseClassName,
      maybePostfixModifierPosition: maybePostfixModifierPosition
    };
  };
}
/**
 * Sorts modifiers according to following schema:
 * - Predefined modifiers are sorted alphabetically
 * - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
 */
function sortModifiers(modifiers) {
  if (modifiers.length <= 1) {
    return modifiers;
  }
  var sortedModifiers = [];
  var unsortedModifiers = [];
  modifiers.forEach(function (modifier) {
    var isArbitraryVariant = modifier[0] === '[';
    if (isArbitraryVariant) {
      sortedModifiers.push.apply(sortedModifiers, unsortedModifiers.sort().concat([modifier]));
      unsortedModifiers = [];
    } else {
      unsortedModifiers.push(modifier);
    }
  });
  sortedModifiers.push.apply(sortedModifiers, unsortedModifiers.sort());
  return sortedModifiers;
}

function createConfigUtils(config) {
  return {
    cache: createLruCache(config.cacheSize),
    splitModifiers: createSplitModifiers(config),
    ...createClassUtils(config)
  };
}

var SPLIT_CLASSES_REGEX = /\s+/;
function mergeClassList(classList, configUtils) {
  var splitModifiers = configUtils.splitModifiers,
    getClassGroupId = configUtils.getClassGroupId,
    getConflictingClassGroupIds = configUtils.getConflictingClassGroupIds;
  /**
   * Set of classGroupIds in following format:
   * `{importantModifier}{variantModifiers}{classGroupId}`
   * @example 'float'
   * @example 'hover:focus:bg-color'
   * @example 'md:!pr'
   */
  var classGroupsInConflict = new Set();
  return classList.trim().split(SPLIT_CLASSES_REGEX).map(function (originalClassName) {
    var _splitModifiers = splitModifiers(originalClassName),
      modifiers = _splitModifiers.modifiers,
      hasImportantModifier = _splitModifiers.hasImportantModifier,
      baseClassName = _splitModifiers.baseClassName,
      maybePostfixModifierPosition = _splitModifiers.maybePostfixModifierPosition;
    var classGroupId = getClassGroupId(maybePostfixModifierPosition ? baseClassName.substring(0, maybePostfixModifierPosition) : baseClassName);
    var hasPostfixModifier = Boolean(maybePostfixModifierPosition);
    if (!classGroupId) {
      if (!maybePostfixModifierPosition) {
        return {
          isTailwindClass: false,
          originalClassName: originalClassName
        };
      }
      classGroupId = getClassGroupId(baseClassName);
      if (!classGroupId) {
        return {
          isTailwindClass: false,
          originalClassName: originalClassName
        };
      }
      hasPostfixModifier = false;
    }
    var variantModifier = sortModifiers(modifiers).join(':');
    var modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
    return {
      isTailwindClass: true,
      modifierId: modifierId,
      classGroupId: classGroupId,
      originalClassName: originalClassName,
      hasPostfixModifier: hasPostfixModifier
    };
  }).reverse()
  // Last class in conflict wins, so we need to filter conflicting classes in reverse order.
  .filter(function (parsed) {
    if (!parsed.isTailwindClass) {
      return true;
    }
    var modifierId = parsed.modifierId,
      classGroupId = parsed.classGroupId,
      hasPostfixModifier = parsed.hasPostfixModifier;
    var classId = modifierId + classGroupId;
    if (classGroupsInConflict.has(classId)) {
      return false;
    }
    classGroupsInConflict.add(classId);
    getConflictingClassGroupIds(classGroupId, hasPostfixModifier).forEach(function (group) {
      return classGroupsInConflict.add(modifierId + group);
    });
    return true;
  }).reverse().map(function (parsed) {
    return parsed.originalClassName;
  }).join(' ');
}

function createTailwindMerge() {
  for (var _len = arguments.length, createConfig = new Array(_len), _key = 0; _key < _len; _key++) {
    createConfig[_key] = arguments[_key];
  }
  var configUtils;
  var cacheGet;
  var cacheSet;
  var functionToCall = initTailwindMerge;
  function initTailwindMerge(classList) {
    var firstCreateConfig = createConfig[0],
      restCreateConfig = createConfig.slice(1);
    var config = restCreateConfig.reduce(function (previousConfig, createConfigCurrent) {
      return createConfigCurrent(previousConfig);
    }, firstCreateConfig());
    configUtils = createConfigUtils(config);
    cacheGet = configUtils.cache.get;
    cacheSet = configUtils.cache.set;
    functionToCall = tailwindMerge;
    return tailwindMerge(classList);
  }
  function tailwindMerge(classList) {
    var cachedResult = cacheGet(classList);
    if (cachedResult) {
      return cachedResult;
    }
    var result = mergeClassList(classList, configUtils);
    cacheSet(classList, result);
    return result;
  }
  return function callTailwindMerge() {
    return functionToCall(twJoin.apply(null, arguments));
  };
}

function fromTheme(key) {
  var themeGetter = function themeGetter(theme) {
    return theme[key] || [];
  };
  themeGetter.isThemeGetter = true;
  return themeGetter;
}

var arbitraryValueRegex = /^\[(?:([a-z-]+):)?(.+)\]$/i;
var fractionRegex = /^\d+\/\d+$/;
var stringLengths = /*#__PURE__*/new Set(['px', 'full', 'screen']);
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))/;
// Shadow always begins with x and y offset separated by underscore
var shadowRegex = /^-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
function isLength(value) {
  return isNumber(value) || stringLengths.has(value) || fractionRegex.test(value) || isArbitraryLength(value);
}
function isArbitraryLength(value) {
  return getIsArbitraryValue(value, 'length', isLengthOnly);
}
function isArbitrarySize(value) {
  return getIsArbitraryValue(value, 'size', isNever);
}
function isArbitraryPosition(value) {
  return getIsArbitraryValue(value, 'position', isNever);
}
function isArbitraryUrl(value) {
  return getIsArbitraryValue(value, 'url', isUrl);
}
function isArbitraryNumber(value) {
  return getIsArbitraryValue(value, 'number', isNumber);
}
function isNumber(value) {
  return !Number.isNaN(Number(value));
}
function isPercent(value) {
  return value.endsWith('%') && isNumber(value.slice(0, -1));
}
function isInteger(value) {
  return isIntegerOnly(value) || getIsArbitraryValue(value, 'number', isIntegerOnly);
}
function isArbitraryValue(value) {
  return arbitraryValueRegex.test(value);
}
function isAny() {
  return true;
}
function isTshirtSize(value) {
  return tshirtUnitRegex.test(value);
}
function isArbitraryShadow(value) {
  return getIsArbitraryValue(value, '', isShadow);
}
function getIsArbitraryValue(value, label, testValue) {
  var result = arbitraryValueRegex.exec(value);
  if (result) {
    if (result[1]) {
      return result[1] === label;
    }
    return testValue(result[2]);
  }
  return false;
}
function isLengthOnly(value) {
  return lengthUnitRegex.test(value);
}
function isNever() {
  return false;
}
function isUrl(value) {
  return value.startsWith('url(');
}
function isIntegerOnly(value) {
  return Number.isInteger(Number(value));
}
function isShadow(value) {
  return shadowRegex.test(value);
}

function getDefaultConfig() {
  var colors = fromTheme('colors');
  var spacing = fromTheme('spacing');
  var blur = fromTheme('blur');
  var brightness = fromTheme('brightness');
  var borderColor = fromTheme('borderColor');
  var borderRadius = fromTheme('borderRadius');
  var borderSpacing = fromTheme('borderSpacing');
  var borderWidth = fromTheme('borderWidth');
  var contrast = fromTheme('contrast');
  var grayscale = fromTheme('grayscale');
  var hueRotate = fromTheme('hueRotate');
  var invert = fromTheme('invert');
  var gap = fromTheme('gap');
  var gradientColorStops = fromTheme('gradientColorStops');
  var gradientColorStopPositions = fromTheme('gradientColorStopPositions');
  var inset = fromTheme('inset');
  var margin = fromTheme('margin');
  var opacity = fromTheme('opacity');
  var padding = fromTheme('padding');
  var saturate = fromTheme('saturate');
  var scale = fromTheme('scale');
  var sepia = fromTheme('sepia');
  var skew = fromTheme('skew');
  var space = fromTheme('space');
  var translate = fromTheme('translate');
  var getOverscroll = function getOverscroll() {
    return ['auto', 'contain', 'none'];
  };
  var getOverflow = function getOverflow() {
    return ['auto', 'hidden', 'clip', 'visible', 'scroll'];
  };
  var getSpacingWithAuto = function getSpacingWithAuto() {
    return ['auto', spacing];
  };
  var getLengthWithEmpty = function getLengthWithEmpty() {
    return ['', isLength];
  };
  var getNumberWithAutoAndArbitrary = function getNumberWithAutoAndArbitrary() {
    return ['auto', isNumber, isArbitraryValue];
  };
  var getPositions = function getPositions() {
    return ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top'];
  };
  var getLineStyles = function getLineStyles() {
    return ['solid', 'dashed', 'dotted', 'double', 'none'];
  };
  var getBlendModes = function getBlendModes() {
    return ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity', 'plus-lighter'];
  };
  var getAlign = function getAlign() {
    return ['start', 'end', 'center', 'between', 'around', 'evenly', 'stretch'];
  };
  var getZeroAndEmpty = function getZeroAndEmpty() {
    return ['', '0', isArbitraryValue];
  };
  var getBreaks = function getBreaks() {
    return ['auto', 'avoid', 'all', 'avoid-page', 'page', 'left', 'right', 'column'];
  };
  var getNumber = function getNumber() {
    return [isNumber, isArbitraryNumber];
  };
  var getNumberAndArbitrary = function getNumberAndArbitrary() {
    return [isNumber, isArbitraryValue];
  };
  return {
    cacheSize: 500,
    theme: {
      colors: [isAny],
      spacing: [isLength],
      blur: ['none', '', isTshirtSize, isArbitraryLength],
      brightness: getNumber(),
      borderColor: [colors],
      borderRadius: ['none', '', 'full', isTshirtSize, isArbitraryLength],
      borderSpacing: [spacing],
      borderWidth: getLengthWithEmpty(),
      contrast: getNumber(),
      grayscale: getZeroAndEmpty(),
      hueRotate: getNumberAndArbitrary(),
      invert: getZeroAndEmpty(),
      gap: [spacing],
      gradientColorStops: [colors],
      gradientColorStopPositions: [isPercent, isArbitraryLength],
      inset: getSpacingWithAuto(),
      margin: getSpacingWithAuto(),
      opacity: getNumber(),
      padding: [spacing],
      saturate: getNumber(),
      scale: getNumber(),
      sepia: getZeroAndEmpty(),
      skew: getNumberAndArbitrary(),
      space: [spacing],
      translate: [spacing]
    },
    classGroups: {
      // Layout
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ['auto', 'square', 'video', isArbitraryValue]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       */
      container: ['container'],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [isTshirtSize]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      'break-after': [{
        'break-after': getBreaks()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      'break-before': [{
        'break-before': getBreaks()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      'break-inside': [{
        'break-inside': ['auto', 'avoid', 'avoid-page', 'avoid-column']
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      'box-decoration': [{
        'box-decoration': ['slice', 'clone']
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ['border', 'content']
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'table', 'inline-table', 'table-caption', 'table-cell', 'table-column', 'table-column-group', 'table-footer-group', 'table-header-group', 'table-row-group', 'table-row', 'flow-root', 'grid', 'inline-grid', 'contents', 'list-item', 'hidden'],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      "float": [{
        "float": ['right', 'left', 'none']
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ['left', 'right', 'both', 'none']
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ['isolate', 'isolation-auto'],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      'object-fit': [{
        object: ['contain', 'cover', 'fill', 'none', 'scale-down']
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      'object-position': [{
        object: [].concat(getPositions(), [isArbitraryValue])
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: getOverflow()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-x': [{
        'overflow-x': getOverflow()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      'overflow-y': [{
        'overflow-y': getOverflow()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: getOverscroll()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-x': [{
        'overscroll-x': getOverscroll()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      'overscroll-y': [{
        'overscroll-y': getOverscroll()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: [inset]
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-x': [{
        'inset-x': [inset]
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      'inset-y': [{
        'inset-y': [inset]
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: [inset]
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: [inset]
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: [inset]
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: [inset]
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: [inset]
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: [inset]
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ['visible', 'invisible', 'collapse'],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: ['auto', isInteger]
      }],
      // Flexbox and Grid
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [spacing]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      'flex-direction': [{
        flex: ['row', 'row-reverse', 'col', 'col-reverse']
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      'flex-wrap': [{
        flex: ['wrap', 'wrap-reverse', 'nowrap']
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: ['1', 'auto', 'initial', 'none', isArbitraryValue]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: getZeroAndEmpty()
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: getZeroAndEmpty()
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: ['first', 'last', 'none', isInteger]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      'grid-cols': [{
        'grid-cols': [isAny]
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start-end': [{
        col: ['auto', {
          span: [isInteger]
        }, isArbitraryValue]
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-start': [{
        'col-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      'col-end': [{
        'col-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      'grid-rows': [{
        'grid-rows': [isAny]
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start-end': [{
        row: ['auto', {
          span: [isInteger]
        }, isArbitraryValue]
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-start': [{
        'row-start': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      'row-end': [{
        'row-end': getNumberWithAutoAndArbitrary()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      'grid-flow': [{
        'grid-flow': ['row', 'col', 'dense', 'row-dense', 'col-dense']
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      'auto-cols': [{
        'auto-cols': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      'auto-rows': [{
        'auto-rows': ['auto', 'min', 'max', 'fr', isArbitraryValue]
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: [gap]
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-x': [{
        'gap-x': [gap]
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      'gap-y': [{
        'gap-y': [gap]
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      'justify-content': [{
        justify: ['normal'].concat(getAlign())
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      'justify-items': [{
        'justify-items': ['start', 'end', 'center', 'stretch']
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      'justify-self': [{
        'justify-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      'align-content': [{
        content: ['normal'].concat(getAlign(), ['baseline'])
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      'align-items': [{
        items: ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      'align-self': [{
        self: ['auto', 'start', 'end', 'center', 'stretch', 'baseline']
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      'place-content': [{
        'place-content': [].concat(getAlign(), ['baseline'])
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      'place-items': [{
        'place-items': ['start', 'end', 'center', 'baseline', 'stretch']
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      'place-self': [{
        'place-self': ['auto', 'start', 'end', 'center', 'stretch']
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: [padding]
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: [padding]
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: [padding]
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: [padding]
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: [padding]
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: [padding]
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: [padding]
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: [padding]
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: [padding]
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: [margin]
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: [margin]
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: [margin]
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: [margin]
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: [margin]
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: [margin]
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: [margin]
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: [margin]
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: [margin]
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/space
       */
      'space-x': [{
        'space-x': [space]
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-x-reverse': ['space-x-reverse'],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/space
       */
      'space-y': [{
        'space-y': [space]
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/space
       */
      'space-y-reverse': ['space-y-reverse'],
      // Sizing
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: ['auto', 'min', 'max', 'fit', spacing]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      'min-w': [{
        'min-w': ['min', 'max', 'fit', isLength]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      'max-w': [{
        'max-w': ['0', 'none', 'full', 'min', 'max', 'fit', 'prose', {
          screen: [isTshirtSize]
        }, isTshirtSize, isArbitraryLength]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: [spacing, 'auto', 'min', 'max', 'fit']
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      'min-h': [{
        'min-h': ['min', 'max', 'fit', isLength]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      'max-h': [{
        'max-h': [spacing, 'min', 'max', 'fit']
      }],
      // Typography
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      'font-size': [{
        text: ['base', isTshirtSize, isArbitraryLength]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      'font-smoothing': ['antialiased', 'subpixel-antialiased'],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      'font-style': ['italic', 'not-italic'],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      'font-weight': [{
        font: ['thin', 'extralight', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black', isArbitraryNumber]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      'font-family': [{
        font: [isAny]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-normal': ['normal-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-ordinal': ['ordinal'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-slashed-zero': ['slashed-zero'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-figure': ['lining-nums', 'oldstyle-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-spacing': ['proportional-nums', 'tabular-nums'],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      'fvn-fraction': ['diagonal-fractions', 'stacked-fractons'],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest', isArbitraryLength]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      'line-clamp': [{
        'line-clamp': ['none', isNumber, isArbitraryNumber]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose', isLength]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      'list-image': [{
        'list-image': ['none', isArbitraryValue]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      'list-style-type': [{
        list: ['none', 'disc', 'decimal', isArbitraryValue]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      'list-style-position': [{
        list: ['inside', 'outside']
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/placeholder-color
       */
      'placeholder-color': [{
        placeholder: [colors]
      }],
      /**
       * Placeholder Opacity
       * @see https://tailwindcss.com/docs/placeholder-opacity
       */
      'placeholder-opacity': [{
        'placeholder-opacity': [opacity]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      'text-alignment': [{
        text: ['left', 'center', 'right', 'justify', 'start', 'end']
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      'text-color': [{
        text: [colors]
      }],
      /**
       * Text Opacity
       * @see https://tailwindcss.com/docs/text-opacity
       */
      'text-opacity': [{
        'text-opacity': [opacity]
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      'text-decoration': ['underline', 'overline', 'line-through', 'no-underline'],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      'text-decoration-style': [{
        decoration: [].concat(getLineStyles(), ['wavy'])
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      'text-decoration-thickness': [{
        decoration: ['auto', 'from-font', isLength]
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      'underline-offset': [{
        'underline-offset': ['auto', isLength]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      'text-decoration-color': [{
        decoration: [colors]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: [spacing]
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      'vertical-align': [{
        align: ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super', isArbitraryLength]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      "break": [{
        "break": ['normal', 'words', 'all', 'keep']
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ['none', 'manual', 'auto']
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ['none', isArbitraryValue]
      }],
      // Backgrounds
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      'bg-attachment': [{
        bg: ['fixed', 'local', 'scroll']
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      'bg-clip': [{
        'bg-clip': ['border', 'padding', 'content', 'text']
      }],
      /**
       * Background Opacity
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/background-opacity
       */
      'bg-opacity': [{
        'bg-opacity': [opacity]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      'bg-origin': [{
        'bg-origin': ['border', 'padding', 'content']
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      'bg-position': [{
        bg: [].concat(getPositions(), [isArbitraryPosition])
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      'bg-repeat': [{
        bg: ['no-repeat', {
          repeat: ['', 'x', 'y', 'round', 'space']
        }]
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      'bg-size': [{
        bg: ['auto', 'cover', 'contain', isArbitrarySize]
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      'bg-image': [{
        bg: ['none', {
          'gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl']
        }, isArbitraryUrl]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      'bg-color': [{
        bg: [colors]
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from-pos': [{
        from: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via-pos': [{
        via: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to-pos': [{
        to: [gradientColorStopPositions]
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-from': [{
        from: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-via': [{
        via: [gradientColorStops]
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      'gradient-to': [{
        to: [gradientColorStops]
      }],
      // Borders
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: [borderRadius]
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-s': [{
        'rounded-s': [borderRadius]
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-e': [{
        'rounded-e': [borderRadius]
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-t': [{
        'rounded-t': [borderRadius]
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-r': [{
        'rounded-r': [borderRadius]
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-b': [{
        'rounded-b': [borderRadius]
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-l': [{
        'rounded-l': [borderRadius]
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ss': [{
        'rounded-ss': [borderRadius]
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-se': [{
        'rounded-se': [borderRadius]
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-ee': [{
        'rounded-ee': [borderRadius]
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-es': [{
        'rounded-es': [borderRadius]
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tl': [{
        'rounded-tl': [borderRadius]
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-tr': [{
        'rounded-tr': [borderRadius]
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-br': [{
        'rounded-br': [borderRadius]
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      'rounded-bl': [{
        'rounded-bl': [borderRadius]
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w': [{
        border: [borderWidth]
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-x': [{
        'border-x': [borderWidth]
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-y': [{
        'border-y': [borderWidth]
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-s': [{
        'border-s': [borderWidth]
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-e': [{
        'border-e': [borderWidth]
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-t': [{
        'border-t': [borderWidth]
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-r': [{
        'border-r': [borderWidth]
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-b': [{
        'border-b': [borderWidth]
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      'border-w-l': [{
        'border-l': [borderWidth]
      }],
      /**
       * Border Opacity
       * @see https://tailwindcss.com/docs/border-opacity
       */
      'border-opacity': [{
        'border-opacity': [opacity]
      }],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      'border-style': [{
        border: [].concat(getLineStyles(), ['hidden'])
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x': [{
        'divide-x': [borderWidth]
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-x-reverse': ['divide-x-reverse'],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y': [{
        'divide-y': [borderWidth]
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/divide-width
       */
      'divide-y-reverse': ['divide-y-reverse'],
      /**
       * Divide Opacity
       * @see https://tailwindcss.com/docs/divide-opacity
       */
      'divide-opacity': [{
        'divide-opacity': [opacity]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/divide-style
       */
      'divide-style': [{
        divide: getLineStyles()
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color': [{
        border: [borderColor]
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-x': [{
        'border-x': [borderColor]
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-y': [{
        'border-y': [borderColor]
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-t': [{
        'border-t': [borderColor]
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-r': [{
        'border-r': [borderColor]
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-b': [{
        'border-b': [borderColor]
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      'border-color-l': [{
        'border-l': [borderColor]
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      'divide-color': [{
        divide: [borderColor]
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      'outline-style': [{
        outline: [''].concat(getLineStyles())
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      'outline-offset': [{
        'outline-offset': [isLength]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      'outline-w': [{
        outline: [isLength]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      'outline-color': [{
        outline: [colors]
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w': [{
        ring: getLengthWithEmpty()
      }],
      /**
       * Ring Width Inset
       * @see https://tailwindcss.com/docs/ring-width
       */
      'ring-w-inset': ['ring-inset'],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/ring-color
       */
      'ring-color': [{
        ring: [colors]
      }],
      /**
       * Ring Opacity
       * @see https://tailwindcss.com/docs/ring-opacity
       */
      'ring-opacity': [{
        'ring-opacity': [opacity]
      }],
      /**
       * Ring Offset Width
       * @see https://tailwindcss.com/docs/ring-offset-width
       */
      'ring-offset-w': [{
        'ring-offset': [isLength]
      }],
      /**
       * Ring Offset Color
       * @see https://tailwindcss.com/docs/ring-offset-color
       */
      'ring-offset-color': [{
        'ring-offset': [colors]
      }],
      // Effects
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: ['', 'inner', 'none', isTshirtSize, isArbitraryShadow]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow-color
       */
      'shadow-color': [{
        shadow: [isAny]
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [opacity]
      }],
      /**
       * Mix Beldn Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      'mix-blend': [{
        'mix-blend': getBlendModes()
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      'bg-blend': [{
        'bg-blend': getBlendModes()
      }],
      // Filters
      /**
       * Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: ['', 'none']
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: [blur]
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [brightness]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [contrast]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      'drop-shadow': [{
        'drop-shadow': ['', 'none', isTshirtSize, isArbitraryValue]
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: [grayscale]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      'hue-rotate': [{
        'hue-rotate': [hueRotate]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: [invert]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [saturate]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: [sepia]
      }],
      /**
       * Backdrop Filter
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      'backdrop-filter': [{
        'backdrop-filter': ['', 'none']
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      'backdrop-blur': [{
        'backdrop-blur': [blur]
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      'backdrop-brightness': [{
        'backdrop-brightness': [brightness]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      'backdrop-contrast': [{
        'backdrop-contrast': [contrast]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      'backdrop-grayscale': [{
        'backdrop-grayscale': [grayscale]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      'backdrop-hue-rotate': [{
        'backdrop-hue-rotate': [hueRotate]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      'backdrop-invert': [{
        'backdrop-invert': [invert]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      'backdrop-opacity': [{
        'backdrop-opacity': [opacity]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      'backdrop-saturate': [{
        'backdrop-saturate': [saturate]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      'backdrop-sepia': [{
        'backdrop-sepia': [sepia]
      }],
      // Tables
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      'border-collapse': [{
        border: ['collapse', 'separate']
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing': [{
        'border-spacing': [borderSpacing]
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-x': [{
        'border-spacing-x': [borderSpacing]
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      'border-spacing-y': [{
        'border-spacing-y': [borderSpacing]
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      'table-layout': [{
        table: ['auto', 'fixed']
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ['top', 'bottom']
      }],
      // Transitions and Animation
      /**
       * Tranisition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ['none', 'all', '', 'colors', 'opacity', 'shadow', 'transform', isArbitraryValue]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: getNumberAndArbitrary()
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ['linear', 'in', 'out', 'in-out', isArbitraryValue]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: getNumberAndArbitrary()
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ['none', 'spin', 'ping', 'pulse', 'bounce', isArbitraryValue]
      }],
      // Transforms
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: ['', 'gpu', 'none']
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: [scale]
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-x': [{
        'scale-x': [scale]
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      'scale-y': [{
        'scale-y': [scale]
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: [isInteger, isArbitraryValue]
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-x': [{
        'translate-x': [translate]
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      'translate-y': [{
        'translate-y': [translate]
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-x': [{
        'skew-x': [skew]
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      'skew-y': [{
        'skew-y': [skew]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      'transform-origin': [{
        origin: ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left', isArbitraryValue]
      }],
      // Interactivity
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: ['auto', colors]
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: ['appearance-none'],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ['auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'context-menu', 'progress', 'cell', 'crosshair', 'vertical-text', 'alias', 'copy', 'no-drop', 'grab', 'grabbing', 'all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize', 'zoom-in', 'zoom-out', isArbitraryValue]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      'caret-color': [{
        caret: [colors]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      'pointer-events': [{
        'pointer-events': ['none', 'auto']
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ['none', 'y', 'x', '']
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      'scroll-behavior': [{
        scroll: ['auto', 'smooth']
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-m': [{
        'scroll-m': [spacing]
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mx': [{
        'scroll-mx': [spacing]
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-my': [{
        'scroll-my': [spacing]
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ms': [{
        'scroll-ms': [spacing]
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-me': [{
        'scroll-me': [spacing]
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mt': [{
        'scroll-mt': [spacing]
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mr': [{
        'scroll-mr': [spacing]
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-mb': [{
        'scroll-mb': [spacing]
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      'scroll-ml': [{
        'scroll-ml': [spacing]
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-p': [{
        'scroll-p': [spacing]
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-px': [{
        'scroll-px': [spacing]
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-py': [{
        'scroll-py': [spacing]
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-ps': [{
        'scroll-ps': [spacing]
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pe': [{
        'scroll-pe': [spacing]
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pt': [{
        'scroll-pt': [spacing]
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pr': [{
        'scroll-pr': [spacing]
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pb': [{
        'scroll-pb': [spacing]
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      'scroll-pl': [{
        'scroll-pl': [spacing]
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      'snap-align': [{
        snap: ['start', 'end', 'center', 'align-none']
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      'snap-stop': [{
        snap: ['normal', 'always']
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-type': [{
        snap: ['none', 'x', 'y', 'both']
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      'snap-strictness': [{
        snap: ['mandatory', 'proximity']
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ['auto', 'none', 'pinch-zoom', 'manipulation', {
          pan: ['x', 'left', 'right', 'y', 'up', 'down']
        }]
      }],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ['none', 'text', 'all', 'auto']
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      'will-change': [{
        'will-change': ['auto', 'scroll', 'contents', 'transform', isArbitraryValue]
      }],
      // SVG
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: [colors, 'none']
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      'stroke-w': [{
        stroke: [isLength, isArbitraryNumber]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: [colors, 'none']
      }],
      // Accessibility
      /**
       * Screen Readers
       * @see https://tailwindcss.com/docs/screen-readers
       */
      sr: ['sr-only', 'not-sr-only']
    },
    conflictingClassGroups: {
      overflow: ['overflow-x', 'overflow-y'],
      overscroll: ['overscroll-x', 'overscroll-y'],
      inset: ['inset-x', 'inset-y', 'start', 'end', 'top', 'right', 'bottom', 'left'],
      'inset-x': ['right', 'left'],
      'inset-y': ['top', 'bottom'],
      flex: ['basis', 'grow', 'shrink'],
      gap: ['gap-x', 'gap-y'],
      p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
      px: ['pr', 'pl'],
      py: ['pt', 'pb'],
      m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
      mx: ['mr', 'ml'],
      my: ['mt', 'mb'],
      'font-size': ['leading'],
      'fvn-normal': ['fvn-ordinal', 'fvn-slashed-zero', 'fvn-figure', 'fvn-spacing', 'fvn-fraction'],
      'fvn-ordinal': ['fvn-normal'],
      'fvn-slashed-zero': ['fvn-normal'],
      'fvn-figure': ['fvn-normal'],
      'fvn-spacing': ['fvn-normal'],
      'fvn-fraction': ['fvn-normal'],
      rounded: ['rounded-s', 'rounded-e', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-ss', 'rounded-se', 'rounded-ee', 'rounded-es', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl'],
      'rounded-s': ['rounded-ss', 'rounded-es'],
      'rounded-e': ['rounded-se', 'rounded-ee'],
      'rounded-t': ['rounded-tl', 'rounded-tr'],
      'rounded-r': ['rounded-tr', 'rounded-br'],
      'rounded-b': ['rounded-br', 'rounded-bl'],
      'rounded-l': ['rounded-tl', 'rounded-bl'],
      'border-spacing': ['border-spacing-x', 'border-spacing-y'],
      'border-w': ['border-w-s', 'border-w-e', 'border-w-t', 'border-w-r', 'border-w-b', 'border-w-l'],
      'border-w-x': ['border-w-r', 'border-w-l'],
      'border-w-y': ['border-w-t', 'border-w-b'],
      'border-color': ['border-color-t', 'border-color-r', 'border-color-b', 'border-color-l'],
      'border-color-x': ['border-color-r', 'border-color-l'],
      'border-color-y': ['border-color-t', 'border-color-b'],
      'scroll-m': ['scroll-mx', 'scroll-my', 'scroll-ms', 'scroll-me', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml'],
      'scroll-mx': ['scroll-mr', 'scroll-ml'],
      'scroll-my': ['scroll-mt', 'scroll-mb'],
      'scroll-p': ['scroll-px', 'scroll-py', 'scroll-ps', 'scroll-pe', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl'],
      'scroll-px': ['scroll-pr', 'scroll-pl'],
      'scroll-py': ['scroll-pt', 'scroll-pb']
    },
    conflictingClassGroupModifiers: {
      'font-size': ['leading']
    }
  };
}

var twMerge = /*#__PURE__*/createTailwindMerge(getDefaultConfig);

var clsxm = function () {
    var classes = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classes[_i] = arguments[_i];
    }
    return twMerge(clsx.apply(void 0, classes));
};

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var chroma$1 = {exports: {}};

/**
 * chroma.js - JavaScript library for color conversions
 *
 * Copyright (c) 2011-2019, Gregor Aisch
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * -------------------------------------------------------
 *
 * chroma.js includes colors from colorbrewer2.org, which are released under
 * the following license:
 *
 * Copyright (c) 2002 Cynthia Brewer, Mark Harrower,
 * and The Pennsylvania State University.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific
 * language governing permissions and limitations under the License.
 *
 * ------------------------------------------------------
 *
 * Named colors are taken from X11 Color Names.
 * http://www.w3.org/TR/css3-color/#svg-color
 *
 * @preserve
 */

(function (module, exports) {
	(function (global, factory) {
	    module.exports = factory() ;
	})(commonjsGlobal, (function () {
	    var limit$2 = function (x, min, max) {
	        if ( min === void 0 ) min=0;
	        if ( max === void 0 ) max=1;

	        return x < min ? min : x > max ? max : x;
	    };

	    var limit$1 = limit$2;

	    var clip_rgb$3 = function (rgb) {
	        rgb._clipped = false;
	        rgb._unclipped = rgb.slice(0);
	        for (var i=0; i<=3; i++) {
	            if (i < 3) {
	                if (rgb[i] < 0 || rgb[i] > 255) { rgb._clipped = true; }
	                rgb[i] = limit$1(rgb[i], 0, 255);
	            } else if (i === 3) {
	                rgb[i] = limit$1(rgb[i], 0, 1);
	            }
	        }
	        return rgb;
	    };

	    // ported from jQuery's $.type
	    var classToType = {};
	    for (var i$1 = 0, list$1 = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Undefined', 'Null']; i$1 < list$1.length; i$1 += 1) {
	        var name = list$1[i$1];

	        classToType[("[object " + name + "]")] = name.toLowerCase();
	    }
	    var type$p = function(obj) {
	        return classToType[Object.prototype.toString.call(obj)] || "object";
	    };

	    var type$o = type$p;

	    var unpack$B = function (args, keyOrder) {
	        if ( keyOrder === void 0 ) keyOrder=null;

	    	// if called with more than 3 arguments, we return the arguments
	        if (args.length >= 3) { return Array.prototype.slice.call(args); }
	        // with less than 3 args we check if first arg is object
	        // and use the keyOrder string to extract and sort properties
	    	if (type$o(args[0]) == 'object' && keyOrder) {
	    		return keyOrder.split('')
	    			.filter(function (k) { return args[0][k] !== undefined; })
	    			.map(function (k) { return args[0][k]; });
	    	}
	    	// otherwise we just return the first argument
	    	// (which we suppose is an array of args)
	        return args[0];
	    };

	    var type$n = type$p;

	    var last$4 = function (args) {
	        if (args.length < 2) { return null; }
	        var l = args.length-1;
	        if (type$n(args[l]) == 'string') { return args[l].toLowerCase(); }
	        return null;
	    };

	    var PI$2 = Math.PI;

	    var utils = {
	    	clip_rgb: clip_rgb$3,
	    	limit: limit$2,
	    	type: type$p,
	    	unpack: unpack$B,
	    	last: last$4,
	    	PI: PI$2,
	    	TWOPI: PI$2*2,
	    	PITHIRD: PI$2/3,
	    	DEG2RAD: PI$2 / 180,
	    	RAD2DEG: 180 / PI$2
	    };

	    var input$h = {
	    	format: {},
	    	autodetect: []
	    };

	    var last$3 = utils.last;
	    var clip_rgb$2 = utils.clip_rgb;
	    var type$m = utils.type;
	    var _input = input$h;

	    var Color$D = function Color() {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var me = this;
	        if (type$m(args[0]) === 'object' &&
	            args[0].constructor &&
	            args[0].constructor === this.constructor) {
	            // the argument is already a Color instance
	            return args[0];
	        }

	        // last argument could be the mode
	        var mode = last$3(args);
	        var autodetect = false;

	        if (!mode) {
	            autodetect = true;
	            if (!_input.sorted) {
	                _input.autodetect = _input.autodetect.sort(function (a,b) { return b.p - a.p; });
	                _input.sorted = true;
	            }
	            // auto-detect format
	            for (var i = 0, list = _input.autodetect; i < list.length; i += 1) {
	                var chk = list[i];

	                mode = chk.test.apply(chk, args);
	                if (mode) { break; }
	            }
	        }

	        if (_input.format[mode]) {
	            var rgb = _input.format[mode].apply(null, autodetect ? args : args.slice(0,-1));
	            me._rgb = clip_rgb$2(rgb);
	        } else {
	            throw new Error('unknown format: '+args);
	        }

	        // add alpha channel
	        if (me._rgb.length === 3) { me._rgb.push(1); }
	    };

	    Color$D.prototype.toString = function toString () {
	        if (type$m(this.hex) == 'function') { return this.hex(); }
	        return ("[" + (this._rgb.join(',')) + "]");
	    };

	    var Color_1 = Color$D;

	    var chroma$k = function () {
	    	var args = [], len = arguments.length;
	    	while ( len-- ) args[ len ] = arguments[ len ];

	    	return new (Function.prototype.bind.apply( chroma$k.Color, [ null ].concat( args) ));
	    };

	    chroma$k.Color = Color_1;
	    chroma$k.version = '2.4.2';

	    var chroma_1 = chroma$k;

	    var unpack$A = utils.unpack;
	    var max$2 = Math.max;

	    var rgb2cmyk$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$A(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        r = r / 255;
	        g = g / 255;
	        b = b / 255;
	        var k = 1 - max$2(r,max$2(g,b));
	        var f = k < 1 ? 1 / (1-k) : 0;
	        var c = (1-r-k) * f;
	        var m = (1-g-k) * f;
	        var y = (1-b-k) * f;
	        return [c,m,y,k];
	    };

	    var rgb2cmyk_1 = rgb2cmyk$1;

	    var unpack$z = utils.unpack;

	    var cmyk2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$z(args, 'cmyk');
	        var c = args[0];
	        var m = args[1];
	        var y = args[2];
	        var k = args[3];
	        var alpha = args.length > 4 ? args[4] : 1;
	        if (k === 1) { return [0,0,0,alpha]; }
	        return [
	            c >= 1 ? 0 : 255 * (1-c) * (1-k), // r
	            m >= 1 ? 0 : 255 * (1-m) * (1-k), // g
	            y >= 1 ? 0 : 255 * (1-y) * (1-k), // b
	            alpha
	        ];
	    };

	    var cmyk2rgb_1 = cmyk2rgb;

	    var chroma$j = chroma_1;
	    var Color$C = Color_1;
	    var input$g = input$h;
	    var unpack$y = utils.unpack;
	    var type$l = utils.type;

	    var rgb2cmyk = rgb2cmyk_1;

	    Color$C.prototype.cmyk = function() {
	        return rgb2cmyk(this._rgb);
	    };

	    chroma$j.cmyk = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$C, [ null ].concat( args, ['cmyk']) ));
	    };

	    input$g.format.cmyk = cmyk2rgb_1;

	    input$g.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$y(args, 'cmyk');
	            if (type$l(args) === 'array' && args.length === 4) {
	                return 'cmyk';
	            }
	        }
	    });

	    var unpack$x = utils.unpack;
	    var last$2 = utils.last;
	    var rnd = function (a) { return Math.round(a*100)/100; };

	    /*
	     * supported arguments:
	     * - hsl2css(h,s,l)
	     * - hsl2css(h,s,l,a)
	     * - hsl2css([h,s,l], mode)
	     * - hsl2css([h,s,l,a], mode)
	     * - hsl2css({h,s,l,a}, mode)
	     */
	    var hsl2css$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var hsla = unpack$x(args, 'hsla');
	        var mode = last$2(args) || 'lsa';
	        hsla[0] = rnd(hsla[0] || 0);
	        hsla[1] = rnd(hsla[1]*100) + '%';
	        hsla[2] = rnd(hsla[2]*100) + '%';
	        if (mode === 'hsla' || (hsla.length > 3 && hsla[3]<1)) {
	            hsla[3] = hsla.length > 3 ? hsla[3] : 1;
	            mode = 'hsla';
	        } else {
	            hsla.length = 3;
	        }
	        return (mode + "(" + (hsla.join(',')) + ")");
	    };

	    var hsl2css_1 = hsl2css$1;

	    var unpack$w = utils.unpack;

	    /*
	     * supported arguments:
	     * - rgb2hsl(r,g,b)
	     * - rgb2hsl(r,g,b,a)
	     * - rgb2hsl([r,g,b])
	     * - rgb2hsl([r,g,b,a])
	     * - rgb2hsl({r,g,b,a})
	     */
	    var rgb2hsl$3 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$w(args, 'rgba');
	        var r = args[0];
	        var g = args[1];
	        var b = args[2];

	        r /= 255;
	        g /= 255;
	        b /= 255;

	        var min = Math.min(r, g, b);
	        var max = Math.max(r, g, b);

	        var l = (max + min) / 2;
	        var s, h;

	        if (max === min){
	            s = 0;
	            h = Number.NaN;
	        } else {
	            s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
	        }

	        if (r == max) { h = (g - b) / (max - min); }
	        else if (g == max) { h = 2 + (b - r) / (max - min); }
	        else if (b == max) { h = 4 + (r - g) / (max - min); }

	        h *= 60;
	        if (h < 0) { h += 360; }
	        if (args.length>3 && args[3]!==undefined) { return [h,s,l,args[3]]; }
	        return [h,s,l];
	    };

	    var rgb2hsl_1 = rgb2hsl$3;

	    var unpack$v = utils.unpack;
	    var last$1 = utils.last;
	    var hsl2css = hsl2css_1;
	    var rgb2hsl$2 = rgb2hsl_1;
	    var round$6 = Math.round;

	    /*
	     * supported arguments:
	     * - rgb2css(r,g,b)
	     * - rgb2css(r,g,b,a)
	     * - rgb2css([r,g,b], mode)
	     * - rgb2css([r,g,b,a], mode)
	     * - rgb2css({r,g,b,a}, mode)
	     */
	    var rgb2css$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgba = unpack$v(args, 'rgba');
	        var mode = last$1(args) || 'rgb';
	        if (mode.substr(0,3) == 'hsl') {
	            return hsl2css(rgb2hsl$2(rgba), mode);
	        }
	        rgba[0] = round$6(rgba[0]);
	        rgba[1] = round$6(rgba[1]);
	        rgba[2] = round$6(rgba[2]);
	        if (mode === 'rgba' || (rgba.length > 3 && rgba[3]<1)) {
	            rgba[3] = rgba.length > 3 ? rgba[3] : 1;
	            mode = 'rgba';
	        }
	        return (mode + "(" + (rgba.slice(0,mode==='rgb'?3:4).join(',')) + ")");
	    };

	    var rgb2css_1 = rgb2css$1;

	    var unpack$u = utils.unpack;
	    var round$5 = Math.round;

	    var hsl2rgb$1 = function () {
	        var assign;

	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];
	        args = unpack$u(args, 'hsl');
	        var h = args[0];
	        var s = args[1];
	        var l = args[2];
	        var r,g,b;
	        if (s === 0) {
	            r = g = b = l*255;
	        } else {
	            var t3 = [0,0,0];
	            var c = [0,0,0];
	            var t2 = l < 0.5 ? l * (1+s) : l+s-l*s;
	            var t1 = 2 * l - t2;
	            var h_ = h / 360;
	            t3[0] = h_ + 1/3;
	            t3[1] = h_;
	            t3[2] = h_ - 1/3;
	            for (var i=0; i<3; i++) {
	                if (t3[i] < 0) { t3[i] += 1; }
	                if (t3[i] > 1) { t3[i] -= 1; }
	                if (6 * t3[i] < 1)
	                    { c[i] = t1 + (t2 - t1) * 6 * t3[i]; }
	                else if (2 * t3[i] < 1)
	                    { c[i] = t2; }
	                else if (3 * t3[i] < 2)
	                    { c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6; }
	                else
	                    { c[i] = t1; }
	            }
	            (assign = [round$5(c[0]*255),round$5(c[1]*255),round$5(c[2]*255)], r = assign[0], g = assign[1], b = assign[2]);
	        }
	        if (args.length > 3) {
	            // keep alpha channel
	            return [r,g,b,args[3]];
	        }
	        return [r,g,b,1];
	    };

	    var hsl2rgb_1 = hsl2rgb$1;

	    var hsl2rgb = hsl2rgb_1;
	    var input$f = input$h;

	    var RE_RGB = /^rgb\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*\)$/;
	    var RE_RGBA = /^rgba\(\s*(-?\d+),\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*([01]|[01]?\.\d+)\)$/;
	    var RE_RGB_PCT = /^rgb\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
	    var RE_RGBA_PCT = /^rgba\(\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;
	    var RE_HSL = /^hsl\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*\)$/;
	    var RE_HSLA = /^hsla\(\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%\s*,\s*(-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)$/;

	    var round$4 = Math.round;

	    var css2rgb$1 = function (css) {
	        css = css.toLowerCase().trim();
	        var m;

	        if (input$f.format.named) {
	            try {
	                return input$f.format.named(css);
	            } catch (e) {
	                // eslint-disable-next-line
	            }
	        }

	        // rgb(250,20,0)
	        if ((m = css.match(RE_RGB))) {
	            var rgb = m.slice(1,4);
	            for (var i=0; i<3; i++) {
	                rgb[i] = +rgb[i];
	            }
	            rgb[3] = 1;  // default alpha
	            return rgb;
	        }

	        // rgba(250,20,0,0.4)
	        if ((m = css.match(RE_RGBA))) {
	            var rgb$1 = m.slice(1,5);
	            for (var i$1=0; i$1<4; i$1++) {
	                rgb$1[i$1] = +rgb$1[i$1];
	            }
	            return rgb$1;
	        }

	        // rgb(100%,0%,0%)
	        if ((m = css.match(RE_RGB_PCT))) {
	            var rgb$2 = m.slice(1,4);
	            for (var i$2=0; i$2<3; i$2++) {
	                rgb$2[i$2] = round$4(rgb$2[i$2] * 2.55);
	            }
	            rgb$2[3] = 1;  // default alpha
	            return rgb$2;
	        }

	        // rgba(100%,0%,0%,0.4)
	        if ((m = css.match(RE_RGBA_PCT))) {
	            var rgb$3 = m.slice(1,5);
	            for (var i$3=0; i$3<3; i$3++) {
	                rgb$3[i$3] = round$4(rgb$3[i$3] * 2.55);
	            }
	            rgb$3[3] = +rgb$3[3];
	            return rgb$3;
	        }

	        // hsl(0,100%,50%)
	        if ((m = css.match(RE_HSL))) {
	            var hsl = m.slice(1,4);
	            hsl[1] *= 0.01;
	            hsl[2] *= 0.01;
	            var rgb$4 = hsl2rgb(hsl);
	            rgb$4[3] = 1;
	            return rgb$4;
	        }

	        // hsla(0,100%,50%,0.5)
	        if ((m = css.match(RE_HSLA))) {
	            var hsl$1 = m.slice(1,4);
	            hsl$1[1] *= 0.01;
	            hsl$1[2] *= 0.01;
	            var rgb$5 = hsl2rgb(hsl$1);
	            rgb$5[3] = +m[4];  // default alpha = 1
	            return rgb$5;
	        }
	    };

	    css2rgb$1.test = function (s) {
	        return RE_RGB.test(s) ||
	            RE_RGBA.test(s) ||
	            RE_RGB_PCT.test(s) ||
	            RE_RGBA_PCT.test(s) ||
	            RE_HSL.test(s) ||
	            RE_HSLA.test(s);
	    };

	    var css2rgb_1 = css2rgb$1;

	    var chroma$i = chroma_1;
	    var Color$B = Color_1;
	    var input$e = input$h;
	    var type$k = utils.type;

	    var rgb2css = rgb2css_1;
	    var css2rgb = css2rgb_1;

	    Color$B.prototype.css = function(mode) {
	        return rgb2css(this._rgb, mode);
	    };

	    chroma$i.css = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$B, [ null ].concat( args, ['css']) ));
	    };

	    input$e.format.css = css2rgb;

	    input$e.autodetect.push({
	        p: 5,
	        test: function (h) {
	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	            if (!rest.length && type$k(h) === 'string' && css2rgb.test(h)) {
	                return 'css';
	            }
	        }
	    });

	    var Color$A = Color_1;
	    var chroma$h = chroma_1;
	    var input$d = input$h;
	    var unpack$t = utils.unpack;

	    input$d.format.gl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgb = unpack$t(args, 'rgba');
	        rgb[0] *= 255;
	        rgb[1] *= 255;
	        rgb[2] *= 255;
	        return rgb;
	    };

	    chroma$h.gl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$A, [ null ].concat( args, ['gl']) ));
	    };

	    Color$A.prototype.gl = function() {
	        var rgb = this._rgb;
	        return [rgb[0]/255, rgb[1]/255, rgb[2]/255, rgb[3]];
	    };

	    var unpack$s = utils.unpack;

	    var rgb2hcg$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$s(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var min = Math.min(r, g, b);
	        var max = Math.max(r, g, b);
	        var delta = max - min;
	        var c = delta * 100 / 255;
	        var _g = min / (255 - delta) * 100;
	        var h;
	        if (delta === 0) {
	            h = Number.NaN;
	        } else {
	            if (r === max) { h = (g - b) / delta; }
	            if (g === max) { h = 2+(b - r) / delta; }
	            if (b === max) { h = 4+(r - g) / delta; }
	            h *= 60;
	            if (h < 0) { h += 360; }
	        }
	        return [h, c, _g];
	    };

	    var rgb2hcg_1 = rgb2hcg$1;

	    var unpack$r = utils.unpack;
	    var floor$3 = Math.floor;

	    /*
	     * this is basically just HSV with some minor tweaks
	     *
	     * hue.. [0..360]
	     * chroma .. [0..1]
	     * grayness .. [0..1]
	     */

	    var hcg2rgb = function () {
	        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];
	        args = unpack$r(args, 'hcg');
	        var h = args[0];
	        var c = args[1];
	        var _g = args[2];
	        var r,g,b;
	        _g = _g * 255;
	        var _c = c * 255;
	        if (c === 0) {
	            r = g = b = _g;
	        } else {
	            if (h === 360) { h = 0; }
	            if (h > 360) { h -= 360; }
	            if (h < 0) { h += 360; }
	            h /= 60;
	            var i = floor$3(h);
	            var f = h - i;
	            var p = _g * (1 - c);
	            var q = p + _c * (1 - f);
	            var t = p + _c * f;
	            var v = p + _c;
	            switch (i) {
	                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
	                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
	                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
	                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
	                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
	                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
	            }
	        }
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var hcg2rgb_1 = hcg2rgb;

	    var unpack$q = utils.unpack;
	    var type$j = utils.type;
	    var chroma$g = chroma_1;
	    var Color$z = Color_1;
	    var input$c = input$h;

	    var rgb2hcg = rgb2hcg_1;

	    Color$z.prototype.hcg = function() {
	        return rgb2hcg(this._rgb);
	    };

	    chroma$g.hcg = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$z, [ null ].concat( args, ['hcg']) ));
	    };

	    input$c.format.hcg = hcg2rgb_1;

	    input$c.autodetect.push({
	        p: 1,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$q(args, 'hcg');
	            if (type$j(args) === 'array' && args.length === 3) {
	                return 'hcg';
	            }
	        }
	    });

	    var unpack$p = utils.unpack;
	    var last = utils.last;
	    var round$3 = Math.round;

	    var rgb2hex$2 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$p(args, 'rgba');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var a = ref[3];
	        var mode = last(args) || 'auto';
	        if (a === undefined) { a = 1; }
	        if (mode === 'auto') {
	            mode = a < 1 ? 'rgba' : 'rgb';
	        }
	        r = round$3(r);
	        g = round$3(g);
	        b = round$3(b);
	        var u = r << 16 | g << 8 | b;
	        var str = "000000" + u.toString(16); //#.toUpperCase();
	        str = str.substr(str.length - 6);
	        var hxa = '0' + round$3(a * 255).toString(16);
	        hxa = hxa.substr(hxa.length - 2);
	        switch (mode.toLowerCase()) {
	            case 'rgba': return ("#" + str + hxa);
	            case 'argb': return ("#" + hxa + str);
	            default: return ("#" + str);
	        }
	    };

	    var rgb2hex_1 = rgb2hex$2;

	    var RE_HEX = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
	    var RE_HEXA = /^#?([A-Fa-f0-9]{8}|[A-Fa-f0-9]{4})$/;

	    var hex2rgb$1 = function (hex) {
	        if (hex.match(RE_HEX)) {
	            // remove optional leading #
	            if (hex.length === 4 || hex.length === 7) {
	                hex = hex.substr(1);
	            }
	            // expand short-notation to full six-digit
	            if (hex.length === 3) {
	                hex = hex.split('');
	                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	            }
	            var u = parseInt(hex, 16);
	            var r = u >> 16;
	            var g = u >> 8 & 0xFF;
	            var b = u & 0xFF;
	            return [r,g,b,1];
	        }

	        // match rgba hex format, eg #FF000077
	        if (hex.match(RE_HEXA)) {
	            if (hex.length === 5 || hex.length === 9) {
	                // remove optional leading #
	                hex = hex.substr(1);
	            }
	            // expand short-notation to full eight-digit
	            if (hex.length === 4) {
	                hex = hex.split('');
	                hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]+hex[3]+hex[3];
	            }
	            var u$1 = parseInt(hex, 16);
	            var r$1 = u$1 >> 24 & 0xFF;
	            var g$1 = u$1 >> 16 & 0xFF;
	            var b$1 = u$1 >> 8 & 0xFF;
	            var a = Math.round((u$1 & 0xFF) / 0xFF * 100) / 100;
	            return [r$1,g$1,b$1,a];
	        }

	        // we used to check for css colors here
	        // if _input.css? and rgb = _input.css hex
	        //     return rgb

	        throw new Error(("unknown hex color: " + hex));
	    };

	    var hex2rgb_1 = hex2rgb$1;

	    var chroma$f = chroma_1;
	    var Color$y = Color_1;
	    var type$i = utils.type;
	    var input$b = input$h;

	    var rgb2hex$1 = rgb2hex_1;

	    Color$y.prototype.hex = function(mode) {
	        return rgb2hex$1(this._rgb, mode);
	    };

	    chroma$f.hex = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$y, [ null ].concat( args, ['hex']) ));
	    };

	    input$b.format.hex = hex2rgb_1;
	    input$b.autodetect.push({
	        p: 4,
	        test: function (h) {
	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	            if (!rest.length && type$i(h) === 'string' && [3,4,5,6,7,8,9].indexOf(h.length) >= 0) {
	                return 'hex';
	            }
	        }
	    });

	    var unpack$o = utils.unpack;
	    var TWOPI$2 = utils.TWOPI;
	    var min$2 = Math.min;
	    var sqrt$4 = Math.sqrt;
	    var acos = Math.acos;

	    var rgb2hsi$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        /*
	        borrowed from here:
	        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
	        */
	        var ref = unpack$o(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        r /= 255;
	        g /= 255;
	        b /= 255;
	        var h;
	        var min_ = min$2(r,g,b);
	        var i = (r+g+b) / 3;
	        var s = i > 0 ? 1 - min_/i : 0;
	        if (s === 0) {
	            h = NaN;
	        } else {
	            h = ((r-g)+(r-b)) / 2;
	            h /= sqrt$4((r-g)*(r-g) + (r-b)*(g-b));
	            h = acos(h);
	            if (b > g) {
	                h = TWOPI$2 - h;
	            }
	            h /= TWOPI$2;
	        }
	        return [h*360,s,i];
	    };

	    var rgb2hsi_1 = rgb2hsi$1;

	    var unpack$n = utils.unpack;
	    var limit = utils.limit;
	    var TWOPI$1 = utils.TWOPI;
	    var PITHIRD = utils.PITHIRD;
	    var cos$4 = Math.cos;

	    /*
	     * hue [0..360]
	     * saturation [0..1]
	     * intensity [0..1]
	     */
	    var hsi2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        /*
	        borrowed from here:
	        http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
	        */
	        args = unpack$n(args, 'hsi');
	        var h = args[0];
	        var s = args[1];
	        var i = args[2];
	        var r,g,b;

	        if (isNaN(h)) { h = 0; }
	        if (isNaN(s)) { s = 0; }
	        // normalize hue
	        if (h > 360) { h -= 360; }
	        if (h < 0) { h += 360; }
	        h /= 360;
	        if (h < 1/3) {
	            b = (1-s)/3;
	            r = (1+s*cos$4(TWOPI$1*h)/cos$4(PITHIRD-TWOPI$1*h))/3;
	            g = 1 - (b+r);
	        } else if (h < 2/3) {
	            h -= 1/3;
	            r = (1-s)/3;
	            g = (1+s*cos$4(TWOPI$1*h)/cos$4(PITHIRD-TWOPI$1*h))/3;
	            b = 1 - (r+g);
	        } else {
	            h -= 2/3;
	            g = (1-s)/3;
	            b = (1+s*cos$4(TWOPI$1*h)/cos$4(PITHIRD-TWOPI$1*h))/3;
	            r = 1 - (g+b);
	        }
	        r = limit(i*r*3);
	        g = limit(i*g*3);
	        b = limit(i*b*3);
	        return [r*255, g*255, b*255, args.length > 3 ? args[3] : 1];
	    };

	    var hsi2rgb_1 = hsi2rgb;

	    var unpack$m = utils.unpack;
	    var type$h = utils.type;
	    var chroma$e = chroma_1;
	    var Color$x = Color_1;
	    var input$a = input$h;

	    var rgb2hsi = rgb2hsi_1;

	    Color$x.prototype.hsi = function() {
	        return rgb2hsi(this._rgb);
	    };

	    chroma$e.hsi = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$x, [ null ].concat( args, ['hsi']) ));
	    };

	    input$a.format.hsi = hsi2rgb_1;

	    input$a.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$m(args, 'hsi');
	            if (type$h(args) === 'array' && args.length === 3) {
	                return 'hsi';
	            }
	        }
	    });

	    var unpack$l = utils.unpack;
	    var type$g = utils.type;
	    var chroma$d = chroma_1;
	    var Color$w = Color_1;
	    var input$9 = input$h;

	    var rgb2hsl$1 = rgb2hsl_1;

	    Color$w.prototype.hsl = function() {
	        return rgb2hsl$1(this._rgb);
	    };

	    chroma$d.hsl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$w, [ null ].concat( args, ['hsl']) ));
	    };

	    input$9.format.hsl = hsl2rgb_1;

	    input$9.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$l(args, 'hsl');
	            if (type$g(args) === 'array' && args.length === 3) {
	                return 'hsl';
	            }
	        }
	    });

	    var unpack$k = utils.unpack;
	    var min$1 = Math.min;
	    var max$1 = Math.max;

	    /*
	     * supported arguments:
	     * - rgb2hsv(r,g,b)
	     * - rgb2hsv([r,g,b])
	     * - rgb2hsv({r,g,b})
	     */
	    var rgb2hsl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$k(args, 'rgb');
	        var r = args[0];
	        var g = args[1];
	        var b = args[2];
	        var min_ = min$1(r, g, b);
	        var max_ = max$1(r, g, b);
	        var delta = max_ - min_;
	        var h,s,v;
	        v = max_ / 255.0;
	        if (max_ === 0) {
	            h = Number.NaN;
	            s = 0;
	        } else {
	            s = delta / max_;
	            if (r === max_) { h = (g - b) / delta; }
	            if (g === max_) { h = 2+(b - r) / delta; }
	            if (b === max_) { h = 4+(r - g) / delta; }
	            h *= 60;
	            if (h < 0) { h += 360; }
	        }
	        return [h, s, v]
	    };

	    var rgb2hsv$1 = rgb2hsl;

	    var unpack$j = utils.unpack;
	    var floor$2 = Math.floor;

	    var hsv2rgb = function () {
	        var assign, assign$1, assign$2, assign$3, assign$4, assign$5;

	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];
	        args = unpack$j(args, 'hsv');
	        var h = args[0];
	        var s = args[1];
	        var v = args[2];
	        var r,g,b;
	        v *= 255;
	        if (s === 0) {
	            r = g = b = v;
	        } else {
	            if (h === 360) { h = 0; }
	            if (h > 360) { h -= 360; }
	            if (h < 0) { h += 360; }
	            h /= 60;

	            var i = floor$2(h);
	            var f = h - i;
	            var p = v * (1 - s);
	            var q = v * (1 - s * f);
	            var t = v * (1 - s * (1 - f));

	            switch (i) {
	                case 0: (assign = [v, t, p], r = assign[0], g = assign[1], b = assign[2]); break
	                case 1: (assign$1 = [q, v, p], r = assign$1[0], g = assign$1[1], b = assign$1[2]); break
	                case 2: (assign$2 = [p, v, t], r = assign$2[0], g = assign$2[1], b = assign$2[2]); break
	                case 3: (assign$3 = [p, q, v], r = assign$3[0], g = assign$3[1], b = assign$3[2]); break
	                case 4: (assign$4 = [t, p, v], r = assign$4[0], g = assign$4[1], b = assign$4[2]); break
	                case 5: (assign$5 = [v, p, q], r = assign$5[0], g = assign$5[1], b = assign$5[2]); break
	            }
	        }
	        return [r,g,b,args.length > 3?args[3]:1];
	    };

	    var hsv2rgb_1 = hsv2rgb;

	    var unpack$i = utils.unpack;
	    var type$f = utils.type;
	    var chroma$c = chroma_1;
	    var Color$v = Color_1;
	    var input$8 = input$h;

	    var rgb2hsv = rgb2hsv$1;

	    Color$v.prototype.hsv = function() {
	        return rgb2hsv(this._rgb);
	    };

	    chroma$c.hsv = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$v, [ null ].concat( args, ['hsv']) ));
	    };

	    input$8.format.hsv = hsv2rgb_1;

	    input$8.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$i(args, 'hsv');
	            if (type$f(args) === 'array' && args.length === 3) {
	                return 'hsv';
	            }
	        }
	    });

	    var labConstants = {
	        // Corresponds roughly to RGB brighter/darker
	        Kn: 18,

	        // D65 standard referent
	        Xn: 0.950470,
	        Yn: 1,
	        Zn: 1.088830,

	        t0: 0.137931034,  // 4 / 29
	        t1: 0.206896552,  // 6 / 29
	        t2: 0.12841855,   // 3 * t1 * t1
	        t3: 0.008856452,  // t1 * t1 * t1
	    };

	    var LAB_CONSTANTS$3 = labConstants;
	    var unpack$h = utils.unpack;
	    var pow$a = Math.pow;

	    var rgb2lab$2 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$h(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2xyz(r,g,b);
	        var x = ref$1[0];
	        var y = ref$1[1];
	        var z = ref$1[2];
	        var l = 116 * y - 16;
	        return [l < 0 ? 0 : l, 500 * (x - y), 200 * (y - z)];
	    };

	    var rgb_xyz = function (r) {
	        if ((r /= 255) <= 0.04045) { return r / 12.92; }
	        return pow$a((r + 0.055) / 1.055, 2.4);
	    };

	    var xyz_lab = function (t) {
	        if (t > LAB_CONSTANTS$3.t3) { return pow$a(t, 1 / 3); }
	        return t / LAB_CONSTANTS$3.t2 + LAB_CONSTANTS$3.t0;
	    };

	    var rgb2xyz = function (r,g,b) {
	        r = rgb_xyz(r);
	        g = rgb_xyz(g);
	        b = rgb_xyz(b);
	        var x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS$3.Xn);
	        var y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS$3.Yn);
	        var z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS$3.Zn);
	        return [x,y,z];
	    };

	    var rgb2lab_1 = rgb2lab$2;

	    var LAB_CONSTANTS$2 = labConstants;
	    var unpack$g = utils.unpack;
	    var pow$9 = Math.pow;

	    /*
	     * L* [0..100]
	     * a [-100..100]
	     * b [-100..100]
	     */
	    var lab2rgb$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$g(args, 'lab');
	        var l = args[0];
	        var a = args[1];
	        var b = args[2];
	        var x,y,z, r,g,b_;

	        y = (l + 16) / 116;
	        x = isNaN(a) ? y : y + a / 500;
	        z = isNaN(b) ? y : y - b / 200;

	        y = LAB_CONSTANTS$2.Yn * lab_xyz(y);
	        x = LAB_CONSTANTS$2.Xn * lab_xyz(x);
	        z = LAB_CONSTANTS$2.Zn * lab_xyz(z);

	        r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);  // D65 -> sRGB
	        g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
	        b_ = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);

	        return [r,g,b_,args.length > 3 ? args[3] : 1];
	    };

	    var xyz_rgb = function (r) {
	        return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow$9(r, 1 / 2.4) - 0.055)
	    };

	    var lab_xyz = function (t) {
	        return t > LAB_CONSTANTS$2.t1 ? t * t * t : LAB_CONSTANTS$2.t2 * (t - LAB_CONSTANTS$2.t0)
	    };

	    var lab2rgb_1 = lab2rgb$1;

	    var unpack$f = utils.unpack;
	    var type$e = utils.type;
	    var chroma$b = chroma_1;
	    var Color$u = Color_1;
	    var input$7 = input$h;

	    var rgb2lab$1 = rgb2lab_1;

	    Color$u.prototype.lab = function() {
	        return rgb2lab$1(this._rgb);
	    };

	    chroma$b.lab = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$u, [ null ].concat( args, ['lab']) ));
	    };

	    input$7.format.lab = lab2rgb_1;

	    input$7.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$f(args, 'lab');
	            if (type$e(args) === 'array' && args.length === 3) {
	                return 'lab';
	            }
	        }
	    });

	    var unpack$e = utils.unpack;
	    var RAD2DEG = utils.RAD2DEG;
	    var sqrt$3 = Math.sqrt;
	    var atan2$2 = Math.atan2;
	    var round$2 = Math.round;

	    var lab2lch$2 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$e(args, 'lab');
	        var l = ref[0];
	        var a = ref[1];
	        var b = ref[2];
	        var c = sqrt$3(a * a + b * b);
	        var h = (atan2$2(b, a) * RAD2DEG + 360) % 360;
	        if (round$2(c*10000) === 0) { h = Number.NaN; }
	        return [l, c, h];
	    };

	    var lab2lch_1 = lab2lch$2;

	    var unpack$d = utils.unpack;
	    var rgb2lab = rgb2lab_1;
	    var lab2lch$1 = lab2lch_1;

	    var rgb2lch$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$d(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2lab(r,g,b);
	        var l = ref$1[0];
	        var a = ref$1[1];
	        var b_ = ref$1[2];
	        return lab2lch$1(l,a,b_);
	    };

	    var rgb2lch_1 = rgb2lch$1;

	    var unpack$c = utils.unpack;
	    var DEG2RAD = utils.DEG2RAD;
	    var sin$3 = Math.sin;
	    var cos$3 = Math.cos;

	    var lch2lab$2 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        /*
	        Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
	        These formulas were invented by David Dalrymple to obtain maximum contrast without going
	        out of gamut if the parameters are in the range 0-1.

	        A saturation multiplier was added by Gregor Aisch
	        */
	        var ref = unpack$c(args, 'lch');
	        var l = ref[0];
	        var c = ref[1];
	        var h = ref[2];
	        if (isNaN(h)) { h = 0; }
	        h = h * DEG2RAD;
	        return [l, cos$3(h) * c, sin$3(h) * c]
	    };

	    var lch2lab_1 = lch2lab$2;

	    var unpack$b = utils.unpack;
	    var lch2lab$1 = lch2lab_1;
	    var lab2rgb = lab2rgb_1;

	    var lch2rgb$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$b(args, 'lch');
	        var l = args[0];
	        var c = args[1];
	        var h = args[2];
	        var ref = lch2lab$1 (l,c,h);
	        var L = ref[0];
	        var a = ref[1];
	        var b_ = ref[2];
	        var ref$1 = lab2rgb (L,a,b_);
	        var r = ref$1[0];
	        var g = ref$1[1];
	        var b = ref$1[2];
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var lch2rgb_1 = lch2rgb$1;

	    var unpack$a = utils.unpack;
	    var lch2rgb = lch2rgb_1;

	    var hcl2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var hcl = unpack$a(args, 'hcl').reverse();
	        return lch2rgb.apply(void 0, hcl);
	    };

	    var hcl2rgb_1 = hcl2rgb;

	    var unpack$9 = utils.unpack;
	    var type$d = utils.type;
	    var chroma$a = chroma_1;
	    var Color$t = Color_1;
	    var input$6 = input$h;

	    var rgb2lch = rgb2lch_1;

	    Color$t.prototype.lch = function() { return rgb2lch(this._rgb); };
	    Color$t.prototype.hcl = function() { return rgb2lch(this._rgb).reverse(); };

	    chroma$a.lch = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$t, [ null ].concat( args, ['lch']) ));
	    };
	    chroma$a.hcl = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$t, [ null ].concat( args, ['hcl']) ));
	    };

	    input$6.format.lch = lch2rgb_1;
	    input$6.format.hcl = hcl2rgb_1;

	    ['lch','hcl'].forEach(function (m) { return input$6.autodetect.push({
	        p: 2,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$9(args, m);
	            if (type$d(args) === 'array' && args.length === 3) {
	                return m;
	            }
	        }
	    }); });

	    /**
	    	X11 color names

	    	http://www.w3.org/TR/css3-color/#svg-color
	    */

	    var w3cx11$1 = {
	        aliceblue: '#f0f8ff',
	        antiquewhite: '#faebd7',
	        aqua: '#00ffff',
	        aquamarine: '#7fffd4',
	        azure: '#f0ffff',
	        beige: '#f5f5dc',
	        bisque: '#ffe4c4',
	        black: '#000000',
	        blanchedalmond: '#ffebcd',
	        blue: '#0000ff',
	        blueviolet: '#8a2be2',
	        brown: '#a52a2a',
	        burlywood: '#deb887',
	        cadetblue: '#5f9ea0',
	        chartreuse: '#7fff00',
	        chocolate: '#d2691e',
	        coral: '#ff7f50',
	        cornflower: '#6495ed',
	        cornflowerblue: '#6495ed',
	        cornsilk: '#fff8dc',
	        crimson: '#dc143c',
	        cyan: '#00ffff',
	        darkblue: '#00008b',
	        darkcyan: '#008b8b',
	        darkgoldenrod: '#b8860b',
	        darkgray: '#a9a9a9',
	        darkgreen: '#006400',
	        darkgrey: '#a9a9a9',
	        darkkhaki: '#bdb76b',
	        darkmagenta: '#8b008b',
	        darkolivegreen: '#556b2f',
	        darkorange: '#ff8c00',
	        darkorchid: '#9932cc',
	        darkred: '#8b0000',
	        darksalmon: '#e9967a',
	        darkseagreen: '#8fbc8f',
	        darkslateblue: '#483d8b',
	        darkslategray: '#2f4f4f',
	        darkslategrey: '#2f4f4f',
	        darkturquoise: '#00ced1',
	        darkviolet: '#9400d3',
	        deeppink: '#ff1493',
	        deepskyblue: '#00bfff',
	        dimgray: '#696969',
	        dimgrey: '#696969',
	        dodgerblue: '#1e90ff',
	        firebrick: '#b22222',
	        floralwhite: '#fffaf0',
	        forestgreen: '#228b22',
	        fuchsia: '#ff00ff',
	        gainsboro: '#dcdcdc',
	        ghostwhite: '#f8f8ff',
	        gold: '#ffd700',
	        goldenrod: '#daa520',
	        gray: '#808080',
	        green: '#008000',
	        greenyellow: '#adff2f',
	        grey: '#808080',
	        honeydew: '#f0fff0',
	        hotpink: '#ff69b4',
	        indianred: '#cd5c5c',
	        indigo: '#4b0082',
	        ivory: '#fffff0',
	        khaki: '#f0e68c',
	        laserlemon: '#ffff54',
	        lavender: '#e6e6fa',
	        lavenderblush: '#fff0f5',
	        lawngreen: '#7cfc00',
	        lemonchiffon: '#fffacd',
	        lightblue: '#add8e6',
	        lightcoral: '#f08080',
	        lightcyan: '#e0ffff',
	        lightgoldenrod: '#fafad2',
	        lightgoldenrodyellow: '#fafad2',
	        lightgray: '#d3d3d3',
	        lightgreen: '#90ee90',
	        lightgrey: '#d3d3d3',
	        lightpink: '#ffb6c1',
	        lightsalmon: '#ffa07a',
	        lightseagreen: '#20b2aa',
	        lightskyblue: '#87cefa',
	        lightslategray: '#778899',
	        lightslategrey: '#778899',
	        lightsteelblue: '#b0c4de',
	        lightyellow: '#ffffe0',
	        lime: '#00ff00',
	        limegreen: '#32cd32',
	        linen: '#faf0e6',
	        magenta: '#ff00ff',
	        maroon: '#800000',
	        maroon2: '#7f0000',
	        maroon3: '#b03060',
	        mediumaquamarine: '#66cdaa',
	        mediumblue: '#0000cd',
	        mediumorchid: '#ba55d3',
	        mediumpurple: '#9370db',
	        mediumseagreen: '#3cb371',
	        mediumslateblue: '#7b68ee',
	        mediumspringgreen: '#00fa9a',
	        mediumturquoise: '#48d1cc',
	        mediumvioletred: '#c71585',
	        midnightblue: '#191970',
	        mintcream: '#f5fffa',
	        mistyrose: '#ffe4e1',
	        moccasin: '#ffe4b5',
	        navajowhite: '#ffdead',
	        navy: '#000080',
	        oldlace: '#fdf5e6',
	        olive: '#808000',
	        olivedrab: '#6b8e23',
	        orange: '#ffa500',
	        orangered: '#ff4500',
	        orchid: '#da70d6',
	        palegoldenrod: '#eee8aa',
	        palegreen: '#98fb98',
	        paleturquoise: '#afeeee',
	        palevioletred: '#db7093',
	        papayawhip: '#ffefd5',
	        peachpuff: '#ffdab9',
	        peru: '#cd853f',
	        pink: '#ffc0cb',
	        plum: '#dda0dd',
	        powderblue: '#b0e0e6',
	        purple: '#800080',
	        purple2: '#7f007f',
	        purple3: '#a020f0',
	        rebeccapurple: '#663399',
	        red: '#ff0000',
	        rosybrown: '#bc8f8f',
	        royalblue: '#4169e1',
	        saddlebrown: '#8b4513',
	        salmon: '#fa8072',
	        sandybrown: '#f4a460',
	        seagreen: '#2e8b57',
	        seashell: '#fff5ee',
	        sienna: '#a0522d',
	        silver: '#c0c0c0',
	        skyblue: '#87ceeb',
	        slateblue: '#6a5acd',
	        slategray: '#708090',
	        slategrey: '#708090',
	        snow: '#fffafa',
	        springgreen: '#00ff7f',
	        steelblue: '#4682b4',
	        tan: '#d2b48c',
	        teal: '#008080',
	        thistle: '#d8bfd8',
	        tomato: '#ff6347',
	        turquoise: '#40e0d0',
	        violet: '#ee82ee',
	        wheat: '#f5deb3',
	        white: '#ffffff',
	        whitesmoke: '#f5f5f5',
	        yellow: '#ffff00',
	        yellowgreen: '#9acd32'
	    };

	    var w3cx11_1 = w3cx11$1;

	    var Color$s = Color_1;
	    var input$5 = input$h;
	    var type$c = utils.type;

	    var w3cx11 = w3cx11_1;
	    var hex2rgb = hex2rgb_1;
	    var rgb2hex = rgb2hex_1;

	    Color$s.prototype.name = function() {
	        var hex = rgb2hex(this._rgb, 'rgb');
	        for (var i = 0, list = Object.keys(w3cx11); i < list.length; i += 1) {
	            var n = list[i];

	            if (w3cx11[n] === hex) { return n.toLowerCase(); }
	        }
	        return hex;
	    };

	    input$5.format.named = function (name) {
	        name = name.toLowerCase();
	        if (w3cx11[name]) { return hex2rgb(w3cx11[name]); }
	        throw new Error('unknown color name: '+name);
	    };

	    input$5.autodetect.push({
	        p: 5,
	        test: function (h) {
	            var rest = [], len = arguments.length - 1;
	            while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

	            if (!rest.length && type$c(h) === 'string' && w3cx11[h.toLowerCase()]) {
	                return 'named';
	            }
	        }
	    });

	    var unpack$8 = utils.unpack;

	    var rgb2num$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$8(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        return (r << 16) + (g << 8) + b;
	    };

	    var rgb2num_1 = rgb2num$1;

	    var type$b = utils.type;

	    var num2rgb = function (num) {
	        if (type$b(num) == "number" && num >= 0 && num <= 0xFFFFFF) {
	            var r = num >> 16;
	            var g = (num >> 8) & 0xFF;
	            var b = num & 0xFF;
	            return [r,g,b,1];
	        }
	        throw new Error("unknown num color: "+num);
	    };

	    var num2rgb_1 = num2rgb;

	    var chroma$9 = chroma_1;
	    var Color$r = Color_1;
	    var input$4 = input$h;
	    var type$a = utils.type;

	    var rgb2num = rgb2num_1;

	    Color$r.prototype.num = function() {
	        return rgb2num(this._rgb);
	    };

	    chroma$9.num = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$r, [ null ].concat( args, ['num']) ));
	    };

	    input$4.format.num = num2rgb_1;

	    input$4.autodetect.push({
	        p: 5,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            if (args.length === 1 && type$a(args[0]) === 'number' && args[0] >= 0 && args[0] <= 0xFFFFFF) {
	                return 'num';
	            }
	        }
	    });

	    var chroma$8 = chroma_1;
	    var Color$q = Color_1;
	    var input$3 = input$h;
	    var unpack$7 = utils.unpack;
	    var type$9 = utils.type;
	    var round$1 = Math.round;

	    Color$q.prototype.rgb = function(rnd) {
	        if ( rnd === void 0 ) rnd=true;

	        if (rnd === false) { return this._rgb.slice(0,3); }
	        return this._rgb.slice(0,3).map(round$1);
	    };

	    Color$q.prototype.rgba = function(rnd) {
	        if ( rnd === void 0 ) rnd=true;

	        return this._rgb.slice(0,4).map(function (v,i) {
	            return i<3 ? (rnd === false ? v : round$1(v)) : v;
	        });
	    };

	    chroma$8.rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$q, [ null ].concat( args, ['rgb']) ));
	    };

	    input$3.format.rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgba = unpack$7(args, 'rgba');
	        if (rgba[3] === undefined) { rgba[3] = 1; }
	        return rgba;
	    };

	    input$3.autodetect.push({
	        p: 3,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$7(args, 'rgba');
	            if (type$9(args) === 'array' && (args.length === 3 ||
	                args.length === 4 && type$9(args[3]) == 'number' && args[3] >= 0 && args[3] <= 1)) {
	                return 'rgb';
	            }
	        }
	    });

	    /*
	     * Based on implementation by Neil Bartlett
	     * https://github.com/neilbartlett/color-temperature
	     */

	    var log$1 = Math.log;

	    var temperature2rgb$1 = function (kelvin) {
	        var temp = kelvin / 100;
	        var r,g,b;
	        if (temp < 66) {
	            r = 255;
	            g = temp < 6 ? 0 : -155.25485562709179 - 0.44596950469579133 * (g = temp-2) + 104.49216199393888 * log$1(g);
	            b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp-10) + 115.67994401066147 * log$1(b);
	        } else {
	            r = 351.97690566805693 + 0.114206453784165 * (r = temp-55) - 40.25366309332127 * log$1(r);
	            g = 325.4494125711974 + 0.07943456536662342 * (g = temp-50) - 28.0852963507957 * log$1(g);
	            b = 255;
	        }
	        return [r,g,b,1];
	    };

	    var temperature2rgb_1 = temperature2rgb$1;

	    /*
	     * Based on implementation by Neil Bartlett
	     * https://github.com/neilbartlett/color-temperature
	     **/

	    var temperature2rgb = temperature2rgb_1;
	    var unpack$6 = utils.unpack;
	    var round = Math.round;

	    var rgb2temperature$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var rgb = unpack$6(args, 'rgb');
	        var r = rgb[0], b = rgb[2];
	        var minTemp = 1000;
	        var maxTemp = 40000;
	        var eps = 0.4;
	        var temp;
	        while (maxTemp - minTemp > eps) {
	            temp = (maxTemp + minTemp) * 0.5;
	            var rgb$1 = temperature2rgb(temp);
	            if ((rgb$1[2] / rgb$1[0]) >= (b / r)) {
	                maxTemp = temp;
	            } else {
	                minTemp = temp;
	            }
	        }
	        return round(temp);
	    };

	    var rgb2temperature_1 = rgb2temperature$1;

	    var chroma$7 = chroma_1;
	    var Color$p = Color_1;
	    var input$2 = input$h;

	    var rgb2temperature = rgb2temperature_1;

	    Color$p.prototype.temp =
	    Color$p.prototype.kelvin =
	    Color$p.prototype.temperature = function() {
	        return rgb2temperature(this._rgb);
	    };

	    chroma$7.temp =
	    chroma$7.kelvin =
	    chroma$7.temperature = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$p, [ null ].concat( args, ['temp']) ));
	    };

	    input$2.format.temp =
	    input$2.format.kelvin =
	    input$2.format.temperature = temperature2rgb_1;

	    var unpack$5 = utils.unpack;
	    var cbrt = Math.cbrt;
	    var pow$8 = Math.pow;
	    var sign$1 = Math.sign;

	    var rgb2oklab$2 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        // OKLab color space implementation taken from
	        // https://bottosson.github.io/posts/oklab/
	        var ref = unpack$5(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = [rgb2lrgb(r / 255), rgb2lrgb(g / 255), rgb2lrgb(b / 255)];
	        var lr = ref$1[0];
	        var lg = ref$1[1];
	        var lb = ref$1[2];
	        var l = cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
	        var m = cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
	        var s = cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

	        return [
	            0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
	            1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
	            0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	        ];
	    };

	    var rgb2oklab_1 = rgb2oklab$2;

	    function rgb2lrgb(c) {
	        var abs = Math.abs(c);
	        if (abs < 0.04045) {
	            return c / 12.92;
	        }
	        return (sign$1(c) || 1) * pow$8((abs + 0.055) / 1.055, 2.4);
	    }

	    var unpack$4 = utils.unpack;
	    var pow$7 = Math.pow;
	    var sign = Math.sign;

	    /*
	     * L* [0..100]
	     * a [-100..100]
	     * b [-100..100]
	     */
	    var oklab2rgb$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$4(args, 'lab');
	        var L = args[0];
	        var a = args[1];
	        var b = args[2];

	        var l = pow$7(L + 0.3963377774 * a + 0.2158037573 * b, 3);
	        var m = pow$7(L - 0.1055613458 * a - 0.0638541728 * b, 3);
	        var s = pow$7(L - 0.0894841775 * a - 1.291485548 * b, 3);

	        return [
	            255 * lrgb2rgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
	            255 * lrgb2rgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
	            255 * lrgb2rgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
	            args.length > 3 ? args[3] : 1
	        ];
	    };

	    var oklab2rgb_1 = oklab2rgb$1;

	    function lrgb2rgb(c) {
	        var abs = Math.abs(c);
	        if (abs > 0.0031308) {
	            return (sign(c) || 1) * (1.055 * pow$7(abs, 1 / 2.4) - 0.055);
	        }
	        return c * 12.92;
	    }

	    var unpack$3 = utils.unpack;
	    var type$8 = utils.type;
	    var chroma$6 = chroma_1;
	    var Color$o = Color_1;
	    var input$1 = input$h;

	    var rgb2oklab$1 = rgb2oklab_1;

	    Color$o.prototype.oklab = function () {
	        return rgb2oklab$1(this._rgb);
	    };

	    chroma$6.oklab = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$o, [ null ].concat( args, ['oklab']) ));
	    };

	    input$1.format.oklab = oklab2rgb_1;

	    input$1.autodetect.push({
	        p: 3,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack$3(args, 'oklab');
	            if (type$8(args) === 'array' && args.length === 3) {
	                return 'oklab';
	            }
	        }
	    });

	    var unpack$2 = utils.unpack;
	    var rgb2oklab = rgb2oklab_1;
	    var lab2lch = lab2lch_1;

	    var rgb2oklch$1 = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        var ref = unpack$2(args, 'rgb');
	        var r = ref[0];
	        var g = ref[1];
	        var b = ref[2];
	        var ref$1 = rgb2oklab(r, g, b);
	        var l = ref$1[0];
	        var a = ref$1[1];
	        var b_ = ref$1[2];
	        return lab2lch(l, a, b_);
	    };

	    var rgb2oklch_1 = rgb2oklch$1;

	    var unpack$1 = utils.unpack;
	    var lch2lab = lch2lab_1;
	    var oklab2rgb = oklab2rgb_1;

	    var oklch2rgb = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        args = unpack$1(args, 'lch');
	        var l = args[0];
	        var c = args[1];
	        var h = args[2];
	        var ref = lch2lab(l, c, h);
	        var L = ref[0];
	        var a = ref[1];
	        var b_ = ref[2];
	        var ref$1 = oklab2rgb(L, a, b_);
	        var r = ref$1[0];
	        var g = ref$1[1];
	        var b = ref$1[2];
	        return [r, g, b, args.length > 3 ? args[3] : 1];
	    };

	    var oklch2rgb_1 = oklch2rgb;

	    var unpack = utils.unpack;
	    var type$7 = utils.type;
	    var chroma$5 = chroma_1;
	    var Color$n = Color_1;
	    var input = input$h;

	    var rgb2oklch = rgb2oklch_1;

	    Color$n.prototype.oklch = function () {
	        return rgb2oklch(this._rgb);
	    };

	    chroma$5.oklch = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        return new (Function.prototype.bind.apply( Color$n, [ null ].concat( args, ['oklch']) ));
	    };

	    input.format.oklch = oklch2rgb_1;

	    input.autodetect.push({
	        p: 3,
	        test: function () {
	            var args = [], len = arguments.length;
	            while ( len-- ) args[ len ] = arguments[ len ];

	            args = unpack(args, 'oklch');
	            if (type$7(args) === 'array' && args.length === 3) {
	                return 'oklch';
	            }
	        }
	    });

	    var Color$m = Color_1;
	    var type$6 = utils.type;

	    Color$m.prototype.alpha = function(a, mutate) {
	        if ( mutate === void 0 ) mutate=false;

	        if (a !== undefined && type$6(a) === 'number') {
	            if (mutate) {
	                this._rgb[3] = a;
	                return this;
	            }
	            return new Color$m([this._rgb[0], this._rgb[1], this._rgb[2], a], 'rgb');
	        }
	        return this._rgb[3];
	    };

	    var Color$l = Color_1;

	    Color$l.prototype.clipped = function() {
	        return this._rgb._clipped || false;
	    };

	    var Color$k = Color_1;
	    var LAB_CONSTANTS$1 = labConstants;

	    Color$k.prototype.darken = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	var me = this;
	    	var lab = me.lab();
	    	lab[0] -= LAB_CONSTANTS$1.Kn * amount;
	    	return new Color$k(lab, 'lab').alpha(me.alpha(), true);
	    };

	    Color$k.prototype.brighten = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	return this.darken(-amount);
	    };

	    Color$k.prototype.darker = Color$k.prototype.darken;
	    Color$k.prototype.brighter = Color$k.prototype.brighten;

	    var Color$j = Color_1;

	    Color$j.prototype.get = function (mc) {
	        var ref = mc.split('.');
	        var mode = ref[0];
	        var channel = ref[1];
	        var src = this[mode]();
	        if (channel) {
	            var i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
	            if (i > -1) { return src[i]; }
	            throw new Error(("unknown channel " + channel + " in mode " + mode));
	        } else {
	            return src;
	        }
	    };

	    var Color$i = Color_1;
	    var type$5 = utils.type;
	    var pow$6 = Math.pow;

	    var EPS = 1e-7;
	    var MAX_ITER = 20;

	    Color$i.prototype.luminance = function(lum) {
	        if (lum !== undefined && type$5(lum) === 'number') {
	            if (lum === 0) {
	                // return pure black
	                return new Color$i([0,0,0,this._rgb[3]], 'rgb');
	            }
	            if (lum === 1) {
	                // return pure white
	                return new Color$i([255,255,255,this._rgb[3]], 'rgb');
	            }
	            // compute new color using...
	            var cur_lum = this.luminance();
	            var mode = 'rgb';
	            var max_iter = MAX_ITER;

	            var test = function (low, high) {
	                var mid = low.interpolate(high, 0.5, mode);
	                var lm = mid.luminance();
	                if (Math.abs(lum - lm) < EPS || !max_iter--) {
	                    // close enough
	                    return mid;
	                }
	                return lm > lum ? test(low, mid) : test(mid, high);
	            };

	            var rgb = (cur_lum > lum ? test(new Color$i([0,0,0]), this) : test(this, new Color$i([255,255,255]))).rgb();
	            return new Color$i(rgb.concat( [this._rgb[3]]));
	        }
	        return rgb2luminance.apply(void 0, (this._rgb).slice(0,3));
	    };


	    var rgb2luminance = function (r,g,b) {
	        // relative luminance
	        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
	        r = luminance_x(r);
	        g = luminance_x(g);
	        b = luminance_x(b);
	        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	    };

	    var luminance_x = function (x) {
	        x /= 255;
	        return x <= 0.03928 ? x/12.92 : pow$6((x+0.055)/1.055, 2.4);
	    };

	    var interpolator$1 = {};

	    var Color$h = Color_1;
	    var type$4 = utils.type;
	    var interpolator = interpolator$1;

	    var mix$1 = function (col1, col2, f) {
	        if ( f === void 0 ) f=0.5;
	        var rest = [], len = arguments.length - 3;
	        while ( len-- > 0 ) rest[ len ] = arguments[ len + 3 ];

	        var mode = rest[0] || 'lrgb';
	        if (!interpolator[mode] && !rest.length) {
	            // fall back to the first supported mode
	            mode = Object.keys(interpolator)[0];
	        }
	        if (!interpolator[mode]) {
	            throw new Error(("interpolation mode " + mode + " is not defined"));
	        }
	        if (type$4(col1) !== 'object') { col1 = new Color$h(col1); }
	        if (type$4(col2) !== 'object') { col2 = new Color$h(col2); }
	        return interpolator[mode](col1, col2, f)
	            .alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
	    };

	    var Color$g = Color_1;
	    var mix = mix$1;

	    Color$g.prototype.mix =
	    Color$g.prototype.interpolate = function(col2, f) {
	    	if ( f === void 0 ) f=0.5;
	    	var rest = [], len = arguments.length - 2;
	    	while ( len-- > 0 ) rest[ len ] = arguments[ len + 2 ];

	    	return mix.apply(void 0, [ this, col2, f ].concat( rest ));
	    };

	    var Color$f = Color_1;

	    Color$f.prototype.premultiply = function(mutate) {
	    	if ( mutate === void 0 ) mutate=false;

	    	var rgb = this._rgb;
	    	var a = rgb[3];
	    	if (mutate) {
	    		this._rgb = [rgb[0]*a, rgb[1]*a, rgb[2]*a, a];
	    		return this;
	    	} else {
	    		return new Color$f([rgb[0]*a, rgb[1]*a, rgb[2]*a, a], 'rgb');
	    	}
	    };

	    var Color$e = Color_1;
	    var LAB_CONSTANTS = labConstants;

	    Color$e.prototype.saturate = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	var me = this;
	    	var lch = me.lch();
	    	lch[1] += LAB_CONSTANTS.Kn * amount;
	    	if (lch[1] < 0) { lch[1] = 0; }
	    	return new Color$e(lch, 'lch').alpha(me.alpha(), true);
	    };

	    Color$e.prototype.desaturate = function(amount) {
	    	if ( amount === void 0 ) amount=1;

	    	return this.saturate(-amount);
	    };

	    var Color$d = Color_1;
	    var type$3 = utils.type;

	    Color$d.prototype.set = function (mc, value, mutate) {
	        if ( mutate === void 0 ) mutate = false;

	        var ref = mc.split('.');
	        var mode = ref[0];
	        var channel = ref[1];
	        var src = this[mode]();
	        if (channel) {
	            var i = mode.indexOf(channel) - (mode.substr(0, 2) === 'ok' ? 2 : 0);
	            if (i > -1) {
	                if (type$3(value) == 'string') {
	                    switch (value.charAt(0)) {
	                        case '+':
	                            src[i] += +value;
	                            break;
	                        case '-':
	                            src[i] += +value;
	                            break;
	                        case '*':
	                            src[i] *= +value.substr(1);
	                            break;
	                        case '/':
	                            src[i] /= +value.substr(1);
	                            break;
	                        default:
	                            src[i] = +value;
	                    }
	                } else if (type$3(value) === 'number') {
	                    src[i] = value;
	                } else {
	                    throw new Error("unsupported value for Color.set");
	                }
	                var out = new Color$d(src, mode);
	                if (mutate) {
	                    this._rgb = out._rgb;
	                    return this;
	                }
	                return out;
	            }
	            throw new Error(("unknown channel " + channel + " in mode " + mode));
	        } else {
	            return src;
	        }
	    };

	    var Color$c = Color_1;

	    var rgb = function (col1, col2, f) {
	        var xyz0 = col1._rgb;
	        var xyz1 = col2._rgb;
	        return new Color$c(
	            xyz0[0] + f * (xyz1[0]-xyz0[0]),
	            xyz0[1] + f * (xyz1[1]-xyz0[1]),
	            xyz0[2] + f * (xyz1[2]-xyz0[2]),
	            'rgb'
	        )
	    };

	    // register interpolator
	    interpolator$1.rgb = rgb;

	    var Color$b = Color_1;
	    var sqrt$2 = Math.sqrt;
	    var pow$5 = Math.pow;

	    var lrgb = function (col1, col2, f) {
	        var ref = col1._rgb;
	        var x1 = ref[0];
	        var y1 = ref[1];
	        var z1 = ref[2];
	        var ref$1 = col2._rgb;
	        var x2 = ref$1[0];
	        var y2 = ref$1[1];
	        var z2 = ref$1[2];
	        return new Color$b(
	            sqrt$2(pow$5(x1,2) * (1-f) + pow$5(x2,2) * f),
	            sqrt$2(pow$5(y1,2) * (1-f) + pow$5(y2,2) * f),
	            sqrt$2(pow$5(z1,2) * (1-f) + pow$5(z2,2) * f),
	            'rgb'
	        )
	    };

	    // register interpolator
	    interpolator$1.lrgb = lrgb;

	    var Color$a = Color_1;

	    var lab = function (col1, col2, f) {
	        var xyz0 = col1.lab();
	        var xyz1 = col2.lab();
	        return new Color$a(
	            xyz0[0] + f * (xyz1[0]-xyz0[0]),
	            xyz0[1] + f * (xyz1[1]-xyz0[1]),
	            xyz0[2] + f * (xyz1[2]-xyz0[2]),
	            'lab'
	        )
	    };

	    // register interpolator
	    interpolator$1.lab = lab;

	    var Color$9 = Color_1;

	    var _hsx = function (col1, col2, f, m) {
	        var assign, assign$1;

	        var xyz0, xyz1;
	        if (m === 'hsl') {
	            xyz0 = col1.hsl();
	            xyz1 = col2.hsl();
	        } else if (m === 'hsv') {
	            xyz0 = col1.hsv();
	            xyz1 = col2.hsv();
	        } else if (m === 'hcg') {
	            xyz0 = col1.hcg();
	            xyz1 = col2.hcg();
	        } else if (m === 'hsi') {
	            xyz0 = col1.hsi();
	            xyz1 = col2.hsi();
	        } else if (m === 'lch' || m === 'hcl') {
	            m = 'hcl';
	            xyz0 = col1.hcl();
	            xyz1 = col2.hcl();
	        } else if (m === 'oklch') {
	            xyz0 = col1.oklch().reverse();
	            xyz1 = col2.oklch().reverse();
	        }

	        var hue0, hue1, sat0, sat1, lbv0, lbv1;
	        if (m.substr(0, 1) === 'h' || m === 'oklch') {
	            (assign = xyz0, hue0 = assign[0], sat0 = assign[1], lbv0 = assign[2]);
	            (assign$1 = xyz1, hue1 = assign$1[0], sat1 = assign$1[1], lbv1 = assign$1[2]);
	        }

	        var sat, hue, lbv, dh;

	        if (!isNaN(hue0) && !isNaN(hue1)) {
	            // both colors have hue
	            if (hue1 > hue0 && hue1 - hue0 > 180) {
	                dh = hue1 - (hue0 + 360);
	            } else if (hue1 < hue0 && hue0 - hue1 > 180) {
	                dh = hue1 + 360 - hue0;
	            } else {
	                dh = hue1 - hue0;
	            }
	            hue = hue0 + f * dh;
	        } else if (!isNaN(hue0)) {
	            hue = hue0;
	            if ((lbv1 == 1 || lbv1 == 0) && m != 'hsv') { sat = sat0; }
	        } else if (!isNaN(hue1)) {
	            hue = hue1;
	            if ((lbv0 == 1 || lbv0 == 0) && m != 'hsv') { sat = sat1; }
	        } else {
	            hue = Number.NaN;
	        }

	        if (sat === undefined) { sat = sat0 + f * (sat1 - sat0); }
	        lbv = lbv0 + f * (lbv1 - lbv0);
	        return m === 'oklch' ? new Color$9([lbv, sat, hue], m) : new Color$9([hue, sat, lbv], m);
	    };

	    var interpolate_hsx$5 = _hsx;

	    var lch = function (col1, col2, f) {
	    	return interpolate_hsx$5(col1, col2, f, 'lch');
	    };

	    // register interpolator
	    interpolator$1.lch = lch;
	    interpolator$1.hcl = lch;

	    var Color$8 = Color_1;

	    var num = function (col1, col2, f) {
	        var c1 = col1.num();
	        var c2 = col2.num();
	        return new Color$8(c1 + f * (c2-c1), 'num')
	    };

	    // register interpolator
	    interpolator$1.num = num;

	    var interpolate_hsx$4 = _hsx;

	    var hcg = function (col1, col2, f) {
	    	return interpolate_hsx$4(col1, col2, f, 'hcg');
	    };

	    // register interpolator
	    interpolator$1.hcg = hcg;

	    var interpolate_hsx$3 = _hsx;

	    var hsi = function (col1, col2, f) {
	    	return interpolate_hsx$3(col1, col2, f, 'hsi');
	    };

	    // register interpolator
	    interpolator$1.hsi = hsi;

	    var interpolate_hsx$2 = _hsx;

	    var hsl = function (col1, col2, f) {
	    	return interpolate_hsx$2(col1, col2, f, 'hsl');
	    };

	    // register interpolator
	    interpolator$1.hsl = hsl;

	    var interpolate_hsx$1 = _hsx;

	    var hsv = function (col1, col2, f) {
	    	return interpolate_hsx$1(col1, col2, f, 'hsv');
	    };

	    // register interpolator
	    interpolator$1.hsv = hsv;

	    var Color$7 = Color_1;

	    var oklab = function (col1, col2, f) {
	        var xyz0 = col1.oklab();
	        var xyz1 = col2.oklab();
	        return new Color$7(
	            xyz0[0] + f * (xyz1[0] - xyz0[0]),
	            xyz0[1] + f * (xyz1[1] - xyz0[1]),
	            xyz0[2] + f * (xyz1[2] - xyz0[2]),
	            'oklab'
	        );
	    };

	    // register interpolator
	    interpolator$1.oklab = oklab;

	    var interpolate_hsx = _hsx;

	    var oklch = function (col1, col2, f) {
	        return interpolate_hsx(col1, col2, f, 'oklch');
	    };

	    // register interpolator
	    interpolator$1.oklch = oklch;

	    var Color$6 = Color_1;
	    var clip_rgb$1 = utils.clip_rgb;
	    var pow$4 = Math.pow;
	    var sqrt$1 = Math.sqrt;
	    var PI$1 = Math.PI;
	    var cos$2 = Math.cos;
	    var sin$2 = Math.sin;
	    var atan2$1 = Math.atan2;

	    var average = function (colors, mode, weights) {
	        if ( mode === void 0 ) mode='lrgb';
	        if ( weights === void 0 ) weights=null;

	        var l = colors.length;
	        if (!weights) { weights = Array.from(new Array(l)).map(function () { return 1; }); }
	        // normalize weights
	        var k = l / weights.reduce(function(a, b) { return a + b; });
	        weights.forEach(function (w,i) { weights[i] *= k; });
	        // convert colors to Color objects
	        colors = colors.map(function (c) { return new Color$6(c); });
	        if (mode === 'lrgb') {
	            return _average_lrgb(colors, weights)
	        }
	        var first = colors.shift();
	        var xyz = first.get(mode);
	        var cnt = [];
	        var dx = 0;
	        var dy = 0;
	        // initial color
	        for (var i=0; i<xyz.length; i++) {
	            xyz[i] = (xyz[i] || 0) * weights[0];
	            cnt.push(isNaN(xyz[i]) ? 0 : weights[0]);
	            if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
	                var A = xyz[i] / 180 * PI$1;
	                dx += cos$2(A) * weights[0];
	                dy += sin$2(A) * weights[0];
	            }
	        }

	        var alpha = first.alpha() * weights[0];
	        colors.forEach(function (c,ci) {
	            var xyz2 = c.get(mode);
	            alpha += c.alpha() * weights[ci+1];
	            for (var i=0; i<xyz.length; i++) {
	                if (!isNaN(xyz2[i])) {
	                    cnt[i] += weights[ci+1];
	                    if (mode.charAt(i) === 'h') {
	                        var A = xyz2[i] / 180 * PI$1;
	                        dx += cos$2(A) * weights[ci+1];
	                        dy += sin$2(A) * weights[ci+1];
	                    } else {
	                        xyz[i] += xyz2[i] * weights[ci+1];
	                    }
	                }
	            }
	        });

	        for (var i$1=0; i$1<xyz.length; i$1++) {
	            if (mode.charAt(i$1) === 'h') {
	                var A$1 = atan2$1(dy / cnt[i$1], dx / cnt[i$1]) / PI$1 * 180;
	                while (A$1 < 0) { A$1 += 360; }
	                while (A$1 >= 360) { A$1 -= 360; }
	                xyz[i$1] = A$1;
	            } else {
	                xyz[i$1] = xyz[i$1]/cnt[i$1];
	            }
	        }
	        alpha /= l;
	        return (new Color$6(xyz, mode)).alpha(alpha > 0.99999 ? 1 : alpha, true);
	    };


	    var _average_lrgb = function (colors, weights) {
	        var l = colors.length;
	        var xyz = [0,0,0,0];
	        for (var i=0; i < colors.length; i++) {
	            var col = colors[i];
	            var f = weights[i] / l;
	            var rgb = col._rgb;
	            xyz[0] += pow$4(rgb[0],2) * f;
	            xyz[1] += pow$4(rgb[1],2) * f;
	            xyz[2] += pow$4(rgb[2],2) * f;
	            xyz[3] += rgb[3] * f;
	        }
	        xyz[0] = sqrt$1(xyz[0]);
	        xyz[1] = sqrt$1(xyz[1]);
	        xyz[2] = sqrt$1(xyz[2]);
	        if (xyz[3] > 0.9999999) { xyz[3] = 1; }
	        return new Color$6(clip_rgb$1(xyz));
	    };

	    // minimal multi-purpose interface

	    // @requires utils color analyze

	    var chroma$4 = chroma_1;
	    var type$2 = utils.type;

	    var pow$3 = Math.pow;

	    var scale$2 = function(colors) {

	        // constructor
	        var _mode = 'rgb';
	        var _nacol = chroma$4('#ccc');
	        var _spread = 0;
	        // const _fixed = false;
	        var _domain = [0, 1];
	        var _pos = [];
	        var _padding = [0,0];
	        var _classes = false;
	        var _colors = [];
	        var _out = false;
	        var _min = 0;
	        var _max = 1;
	        var _correctLightness = false;
	        var _colorCache = {};
	        var _useCache = true;
	        var _gamma = 1;

	        // private methods

	        var setColors = function(colors) {
	            colors = colors || ['#fff', '#000'];
	            if (colors && type$2(colors) === 'string' && chroma$4.brewer &&
	                chroma$4.brewer[colors.toLowerCase()]) {
	                colors = chroma$4.brewer[colors.toLowerCase()];
	            }
	            if (type$2(colors) === 'array') {
	                // handle single color
	                if (colors.length === 1) {
	                    colors = [colors[0], colors[0]];
	                }
	                // make a copy of the colors
	                colors = colors.slice(0);
	                // convert to chroma classes
	                for (var c=0; c<colors.length; c++) {
	                    colors[c] = chroma$4(colors[c]);
	                }
	                // auto-fill color position
	                _pos.length = 0;
	                for (var c$1=0; c$1<colors.length; c$1++) {
	                    _pos.push(c$1/(colors.length-1));
	                }
	            }
	            resetCache();
	            return _colors = colors;
	        };

	        var getClass = function(value) {
	            if (_classes != null) {
	                var n = _classes.length-1;
	                var i = 0;
	                while (i < n && value >= _classes[i]) {
	                    i++;
	                }
	                return i-1;
	            }
	            return 0;
	        };

	        var tMapLightness = function (t) { return t; };
	        var tMapDomain = function (t) { return t; };

	        // const classifyValue = function(value) {
	        //     let val = value;
	        //     if (_classes.length > 2) {
	        //         const n = _classes.length-1;
	        //         const i = getClass(value);
	        //         const minc = _classes[0] + ((_classes[1]-_classes[0]) * (0 + (_spread * 0.5)));  // center of 1st class
	        //         const maxc = _classes[n-1] + ((_classes[n]-_classes[n-1]) * (1 - (_spread * 0.5)));  // center of last class
	        //         val = _min + ((((_classes[i] + ((_classes[i+1] - _classes[i]) * 0.5)) - minc) / (maxc-minc)) * (_max - _min));
	        //     }
	        //     return val;
	        // };

	        var getColor = function(val, bypassMap) {
	            var col, t;
	            if (bypassMap == null) { bypassMap = false; }
	            if (isNaN(val) || (val === null)) { return _nacol; }
	            if (!bypassMap) {
	                if (_classes && (_classes.length > 2)) {
	                    // find the class
	                    var c = getClass(val);
	                    t = c / (_classes.length-2);
	                } else if (_max !== _min) {
	                    // just interpolate between min/max
	                    t = (val - _min) / (_max - _min);
	                } else {
	                    t = 1;
	                }
	            } else {
	                t = val;
	            }

	            // domain map
	            t = tMapDomain(t);

	            if (!bypassMap) {
	                t = tMapLightness(t);  // lightness correction
	            }

	            if (_gamma !== 1) { t = pow$3(t, _gamma); }

	            t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));

	            t = Math.min(1, Math.max(0, t));

	            var k = Math.floor(t * 10000);

	            if (_useCache && _colorCache[k]) {
	                col = _colorCache[k];
	            } else {
	                if (type$2(_colors) === 'array') {
	                    //for i in [0.._pos.length-1]
	                    for (var i=0; i<_pos.length; i++) {
	                        var p = _pos[i];
	                        if (t <= p) {
	                            col = _colors[i];
	                            break;
	                        }
	                        if ((t >= p) && (i === (_pos.length-1))) {
	                            col = _colors[i];
	                            break;
	                        }
	                        if (t > p && t < _pos[i+1]) {
	                            t = (t-p)/(_pos[i+1]-p);
	                            col = chroma$4.interpolate(_colors[i], _colors[i+1], t, _mode);
	                            break;
	                        }
	                    }
	                } else if (type$2(_colors) === 'function') {
	                    col = _colors(t);
	                }
	                if (_useCache) { _colorCache[k] = col; }
	            }
	            return col;
	        };

	        var resetCache = function () { return _colorCache = {}; };

	        setColors(colors);

	        // public interface

	        var f = function(v) {
	            var c = chroma$4(getColor(v));
	            if (_out && c[_out]) { return c[_out](); } else { return c; }
	        };

	        f.classes = function(classes) {
	            if (classes != null) {
	                if (type$2(classes) === 'array') {
	                    _classes = classes;
	                    _domain = [classes[0], classes[classes.length-1]];
	                } else {
	                    var d = chroma$4.analyze(_domain);
	                    if (classes === 0) {
	                        _classes = [d.min, d.max];
	                    } else {
	                        _classes = chroma$4.limits(d, 'e', classes);
	                    }
	                }
	                return f;
	            }
	            return _classes;
	        };


	        f.domain = function(domain) {
	            if (!arguments.length) {
	                return _domain;
	            }
	            _min = domain[0];
	            _max = domain[domain.length-1];
	            _pos = [];
	            var k = _colors.length;
	            if ((domain.length === k) && (_min !== _max)) {
	                // update positions
	                for (var i = 0, list = Array.from(domain); i < list.length; i += 1) {
	                    var d = list[i];

	                  _pos.push((d-_min) / (_max-_min));
	                }
	            } else {
	                for (var c=0; c<k; c++) {
	                    _pos.push(c/(k-1));
	                }
	                if (domain.length > 2) {
	                    // set domain map
	                    var tOut = domain.map(function (d,i) { return i/(domain.length-1); });
	                    var tBreaks = domain.map(function (d) { return (d - _min) / (_max - _min); });
	                    if (!tBreaks.every(function (val, i) { return tOut[i] === val; })) {
	                        tMapDomain = function (t) {
	                            if (t <= 0 || t >= 1) { return t; }
	                            var i = 0;
	                            while (t >= tBreaks[i+1]) { i++; }
	                            var f = (t - tBreaks[i]) / (tBreaks[i+1] - tBreaks[i]);
	                            var out = tOut[i] + f * (tOut[i+1] - tOut[i]);
	                            return out;
	                        };
	                    }

	                }
	            }
	            _domain = [_min, _max];
	            return f;
	        };

	        f.mode = function(_m) {
	            if (!arguments.length) {
	                return _mode;
	            }
	            _mode = _m;
	            resetCache();
	            return f;
	        };

	        f.range = function(colors, _pos) {
	            setColors(colors);
	            return f;
	        };

	        f.out = function(_o) {
	            _out = _o;
	            return f;
	        };

	        f.spread = function(val) {
	            if (!arguments.length) {
	                return _spread;
	            }
	            _spread = val;
	            return f;
	        };

	        f.correctLightness = function(v) {
	            if (v == null) { v = true; }
	            _correctLightness = v;
	            resetCache();
	            if (_correctLightness) {
	                tMapLightness = function(t) {
	                    var L0 = getColor(0, true).lab()[0];
	                    var L1 = getColor(1, true).lab()[0];
	                    var pol = L0 > L1;
	                    var L_actual = getColor(t, true).lab()[0];
	                    var L_ideal = L0 + ((L1 - L0) * t);
	                    var L_diff = L_actual - L_ideal;
	                    var t0 = 0;
	                    var t1 = 1;
	                    var max_iter = 20;
	                    while ((Math.abs(L_diff) > 1e-2) && (max_iter-- > 0)) {
	                        (function() {
	                            if (pol) { L_diff *= -1; }
	                            if (L_diff < 0) {
	                                t0 = t;
	                                t += (t1 - t) * 0.5;
	                            } else {
	                                t1 = t;
	                                t += (t0 - t) * 0.5;
	                            }
	                            L_actual = getColor(t, true).lab()[0];
	                            return L_diff = L_actual - L_ideal;
	                        })();
	                    }
	                    return t;
	                };
	            } else {
	                tMapLightness = function (t) { return t; };
	            }
	            return f;
	        };

	        f.padding = function(p) {
	            if (p != null) {
	                if (type$2(p) === 'number') {
	                    p = [p,p];
	                }
	                _padding = p;
	                return f;
	            } else {
	                return _padding;
	            }
	        };

	        f.colors = function(numColors, out) {
	            // If no arguments are given, return the original colors that were provided
	            if (arguments.length < 2) { out = 'hex'; }
	            var result = [];

	            if (arguments.length === 0) {
	                result = _colors.slice(0);

	            } else if (numColors === 1) {
	                result = [f(0.5)];

	            } else if (numColors > 1) {
	                var dm = _domain[0];
	                var dd = _domain[1] - dm;
	                result = __range__(0, numColors, false).map(function (i) { return f( dm + ((i/(numColors-1)) * dd) ); });

	            } else { // returns all colors based on the defined classes
	                colors = [];
	                var samples = [];
	                if (_classes && (_classes.length > 2)) {
	                    for (var i = 1, end = _classes.length, asc = 1 <= end; asc ? i < end : i > end; asc ? i++ : i--) {
	                        samples.push((_classes[i-1]+_classes[i])*0.5);
	                    }
	                } else {
	                    samples = _domain;
	                }
	                result = samples.map(function (v) { return f(v); });
	            }

	            if (chroma$4[out]) {
	                result = result.map(function (c) { return c[out](); });
	            }
	            return result;
	        };

	        f.cache = function(c) {
	            if (c != null) {
	                _useCache = c;
	                return f;
	            } else {
	                return _useCache;
	            }
	        };

	        f.gamma = function(g) {
	            if (g != null) {
	                _gamma = g;
	                return f;
	            } else {
	                return _gamma;
	            }
	        };

	        f.nodata = function(d) {
	            if (d != null) {
	                _nacol = chroma$4(d);
	                return f;
	            } else {
	                return _nacol;
	            }
	        };

	        return f;
	    };

	    function __range__(left, right, inclusive) {
	      var range = [];
	      var ascending = left < right;
	      var end = !inclusive ? right : ascending ? right + 1 : right - 1;
	      for (var i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
	        range.push(i);
	      }
	      return range;
	    }

	    //
	    // interpolates between a set of colors uzing a bezier spline
	    //

	    // @requires utils lab
	    var Color$5 = Color_1;

	    var scale$1 = scale$2;

	    // nth row of the pascal triangle
	    var binom_row = function(n) {
	        var row = [1, 1];
	        for (var i = 1; i < n; i++) {
	            var newrow = [1];
	            for (var j = 1; j <= row.length; j++) {
	                newrow[j] = (row[j] || 0) + row[j - 1];
	            }
	            row = newrow;
	        }
	        return row;
	    };

	    var bezier = function(colors) {
	        var assign, assign$1, assign$2;

	        var I, lab0, lab1, lab2;
	        colors = colors.map(function (c) { return new Color$5(c); });
	        if (colors.length === 2) {
	            // linear interpolation
	            (assign = colors.map(function (c) { return c.lab(); }), lab0 = assign[0], lab1 = assign[1]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return lab0[i] + (t * (lab1[i] - lab0[i])); }));
	                return new Color$5(lab, 'lab');
	            };
	        } else if (colors.length === 3) {
	            // quadratic bezier interpolation
	            (assign$1 = colors.map(function (c) { return c.lab(); }), lab0 = assign$1[0], lab1 = assign$1[1], lab2 = assign$1[2]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t) * lab0[i]) + (2 * (1-t) * t * lab1[i]) + (t * t * lab2[i]); }));
	                return new Color$5(lab, 'lab');
	            };
	        } else if (colors.length === 4) {
	            // cubic bezier interpolation
	            var lab3;
	            (assign$2 = colors.map(function (c) { return c.lab(); }), lab0 = assign$2[0], lab1 = assign$2[1], lab2 = assign$2[2], lab3 = assign$2[3]);
	            I = function(t) {
	                var lab = ([0, 1, 2].map(function (i) { return ((1-t)*(1-t)*(1-t) * lab0[i]) + (3 * (1-t) * (1-t) * t * lab1[i]) + (3 * (1-t) * t * t * lab2[i]) + (t*t*t * lab3[i]); }));
	                return new Color$5(lab, 'lab');
	            };
	        } else if (colors.length >= 5) {
	            // general case (degree n bezier)
	            var labs, row, n;
	            labs = colors.map(function (c) { return c.lab(); });
	            n = colors.length - 1;
	            row = binom_row(n);
	            I = function (t) {
	                var u = 1 - t;
	                var lab = ([0, 1, 2].map(function (i) { return labs.reduce(function (sum, el, j) { return (sum + row[j] * Math.pow( u, (n - j) ) * Math.pow( t, j ) * el[i]); }, 0); }));
	                return new Color$5(lab, 'lab');
	            };
	        } else {
	            throw new RangeError("No point in running bezier with only one color.")
	        }
	        return I;
	    };

	    var bezier_1 = function (colors) {
	        var f = bezier(colors);
	        f.scale = function () { return scale$1(f); };
	        return f;
	    };

	    /*
	     * interpolates between a set of colors uzing a bezier spline
	     * blend mode formulas taken from http://www.venture-ware.com/kevin/coding/lets-learn-math-photoshop-blend-modes/
	     */

	    var chroma$3 = chroma_1;

	    var blend = function (bottom, top, mode) {
	        if (!blend[mode]) {
	            throw new Error('unknown blend mode ' + mode);
	        }
	        return blend[mode](bottom, top);
	    };

	    var blend_f = function (f) { return function (bottom,top) {
	            var c0 = chroma$3(top).rgb();
	            var c1 = chroma$3(bottom).rgb();
	            return chroma$3.rgb(f(c0, c1));
	        }; };

	    var each = function (f) { return function (c0, c1) {
	            var out = [];
	            out[0] = f(c0[0], c1[0]);
	            out[1] = f(c0[1], c1[1]);
	            out[2] = f(c0[2], c1[2]);
	            return out;
	        }; };

	    var normal = function (a) { return a; };
	    var multiply = function (a,b) { return a * b / 255; };
	    var darken = function (a,b) { return a > b ? b : a; };
	    var lighten = function (a,b) { return a > b ? a : b; };
	    var screen = function (a,b) { return 255 * (1 - (1-a/255) * (1-b/255)); };
	    var overlay = function (a,b) { return b < 128 ? 2 * a * b / 255 : 255 * (1 - 2 * (1 - a / 255 ) * ( 1 - b / 255 )); };
	    var burn = function (a,b) { return 255 * (1 - (1 - b / 255) / (a/255)); };
	    var dodge = function (a,b) {
	        if (a === 255) { return 255; }
	        a = 255 * (b / 255) / (1 - a / 255);
	        return a > 255 ? 255 : a
	    };

	    // # add = (a,b) ->
	    // #     if (a + b > 255) then 255 else a + b

	    blend.normal = blend_f(each(normal));
	    blend.multiply = blend_f(each(multiply));
	    blend.screen = blend_f(each(screen));
	    blend.overlay = blend_f(each(overlay));
	    blend.darken = blend_f(each(darken));
	    blend.lighten = blend_f(each(lighten));
	    blend.dodge = blend_f(each(dodge));
	    blend.burn = blend_f(each(burn));
	    // blend.add = blend_f(each(add));

	    var blend_1 = blend;

	    // cubehelix interpolation
	    // based on D.A. Green "A colour scheme for the display of astronomical intensity images"
	    // http://astron-soc.in/bulletin/11June/289392011.pdf

	    var type$1 = utils.type;
	    var clip_rgb = utils.clip_rgb;
	    var TWOPI = utils.TWOPI;
	    var pow$2 = Math.pow;
	    var sin$1 = Math.sin;
	    var cos$1 = Math.cos;
	    var chroma$2 = chroma_1;

	    var cubehelix = function(start, rotations, hue, gamma, lightness) {
	        if ( start === void 0 ) start=300;
	        if ( rotations === void 0 ) rotations=-1.5;
	        if ( hue === void 0 ) hue=1;
	        if ( gamma === void 0 ) gamma=1;
	        if ( lightness === void 0 ) lightness=[0,1];

	        var dh = 0, dl;
	        if (type$1(lightness) === 'array') {
	            dl = lightness[1] - lightness[0];
	        } else {
	            dl = 0;
	            lightness = [lightness, lightness];
	        }

	        var f = function(fract) {
	            var a = TWOPI * (((start+120)/360) + (rotations * fract));
	            var l = pow$2(lightness[0] + (dl * fract), gamma);
	            var h = dh !== 0 ? hue[0] + (fract * dh) : hue;
	            var amp = (h * l * (1-l)) / 2;
	            var cos_a = cos$1(a);
	            var sin_a = sin$1(a);
	            var r = l + (amp * ((-0.14861 * cos_a) + (1.78277* sin_a)));
	            var g = l + (amp * ((-0.29227 * cos_a) - (0.90649* sin_a)));
	            var b = l + (amp * (+1.97294 * cos_a));
	            return chroma$2(clip_rgb([r*255,g*255,b*255,1]));
	        };

	        f.start = function(s) {
	            if ((s == null)) { return start; }
	            start = s;
	            return f;
	        };

	        f.rotations = function(r) {
	            if ((r == null)) { return rotations; }
	            rotations = r;
	            return f;
	        };

	        f.gamma = function(g) {
	            if ((g == null)) { return gamma; }
	            gamma = g;
	            return f;
	        };

	        f.hue = function(h) {
	            if ((h == null)) { return hue; }
	            hue = h;
	            if (type$1(hue) === 'array') {
	                dh = hue[1] - hue[0];
	                if (dh === 0) { hue = hue[1]; }
	            } else {
	                dh = 0;
	            }
	            return f;
	        };

	        f.lightness = function(h) {
	            if ((h == null)) { return lightness; }
	            if (type$1(h) === 'array') {
	                lightness = h;
	                dl = h[1] - h[0];
	            } else {
	                lightness = [h,h];
	                dl = 0;
	            }
	            return f;
	        };

	        f.scale = function () { return chroma$2.scale(f); };

	        f.hue(hue);

	        return f;
	    };

	    var Color$4 = Color_1;
	    var digits = '0123456789abcdef';

	    var floor$1 = Math.floor;
	    var random = Math.random;

	    var random_1 = function () {
	        var code = '#';
	        for (var i=0; i<6; i++) {
	            code += digits.charAt(floor$1(random() * 16));
	        }
	        return new Color$4(code, 'hex');
	    };

	    var type = type$p;
	    var log = Math.log;
	    var pow$1 = Math.pow;
	    var floor = Math.floor;
	    var abs$1 = Math.abs;


	    var analyze = function (data, key) {
	        if ( key === void 0 ) key=null;

	        var r = {
	            min: Number.MAX_VALUE,
	            max: Number.MAX_VALUE*-1,
	            sum: 0,
	            values: [],
	            count: 0
	        };
	        if (type(data) === 'object') {
	            data = Object.values(data);
	        }
	        data.forEach(function (val) {
	            if (key && type(val) === 'object') { val = val[key]; }
	            if (val !== undefined && val !== null && !isNaN(val)) {
	                r.values.push(val);
	                r.sum += val;
	                if (val < r.min) { r.min = val; }
	                if (val > r.max) { r.max = val; }
	                r.count += 1;
	            }
	        });

	        r.domain = [r.min, r.max];

	        r.limits = function (mode, num) { return limits(r, mode, num); };

	        return r;
	    };


	    var limits = function (data, mode, num) {
	        if ( mode === void 0 ) mode='equal';
	        if ( num === void 0 ) num=7;

	        if (type(data) == 'array') {
	            data = analyze(data);
	        }
	        var min = data.min;
	        var max = data.max;
	        var values = data.values.sort(function (a,b) { return a-b; });

	        if (num === 1) { return [min,max]; }

	        var limits = [];

	        if (mode.substr(0,1) === 'c') { // continuous
	            limits.push(min);
	            limits.push(max);
	        }

	        if (mode.substr(0,1) === 'e') { // equal interval
	            limits.push(min);
	            for (var i=1; i<num; i++) {
	                limits.push(min+((i/num)*(max-min)));
	            }
	            limits.push(max);
	        }

	        else if (mode.substr(0,1) === 'l') { // log scale
	            if (min <= 0) {
	                throw new Error('Logarithmic scales are only possible for values > 0');
	            }
	            var min_log = Math.LOG10E * log(min);
	            var max_log = Math.LOG10E * log(max);
	            limits.push(min);
	            for (var i$1=1; i$1<num; i$1++) {
	                limits.push(pow$1(10, min_log + ((i$1/num) * (max_log - min_log))));
	            }
	            limits.push(max);
	        }

	        else if (mode.substr(0,1) === 'q') { // quantile scale
	            limits.push(min);
	            for (var i$2=1; i$2<num; i$2++) {
	                var p = ((values.length-1) * i$2)/num;
	                var pb = floor(p);
	                if (pb === p) {
	                    limits.push(values[pb]);
	                } else { // p > pb
	                    var pr = p - pb;
	                    limits.push((values[pb]*(1-pr)) + (values[pb+1]*pr));
	                }
	            }
	            limits.push(max);

	        }

	        else if (mode.substr(0,1) === 'k') { // k-means clustering
	            /*
	            implementation based on
	            http://code.google.com/p/figue/source/browse/trunk/figue.js#336
	            simplified for 1-d input values
	            */
	            var cluster;
	            var n = values.length;
	            var assignments = new Array(n);
	            var clusterSizes = new Array(num);
	            var repeat = true;
	            var nb_iters = 0;
	            var centroids = null;

	            // get seed values
	            centroids = [];
	            centroids.push(min);
	            for (var i$3=1; i$3<num; i$3++) {
	                centroids.push(min + ((i$3/num) * (max-min)));
	            }
	            centroids.push(max);

	            while (repeat) {
	                // assignment step
	                for (var j=0; j<num; j++) {
	                    clusterSizes[j] = 0;
	                }
	                for (var i$4=0; i$4<n; i$4++) {
	                    var value = values[i$4];
	                    var mindist = Number.MAX_VALUE;
	                    var best = (void 0);
	                    for (var j$1=0; j$1<num; j$1++) {
	                        var dist = abs$1(centroids[j$1]-value);
	                        if (dist < mindist) {
	                            mindist = dist;
	                            best = j$1;
	                        }
	                        clusterSizes[best]++;
	                        assignments[i$4] = best;
	                    }
	                }

	                // update centroids step
	                var newCentroids = new Array(num);
	                for (var j$2=0; j$2<num; j$2++) {
	                    newCentroids[j$2] = null;
	                }
	                for (var i$5=0; i$5<n; i$5++) {
	                    cluster = assignments[i$5];
	                    if (newCentroids[cluster] === null) {
	                        newCentroids[cluster] = values[i$5];
	                    } else {
	                        newCentroids[cluster] += values[i$5];
	                    }
	                }
	                for (var j$3=0; j$3<num; j$3++) {
	                    newCentroids[j$3] *= 1/clusterSizes[j$3];
	                }

	                // check convergence
	                repeat = false;
	                for (var j$4=0; j$4<num; j$4++) {
	                    if (newCentroids[j$4] !== centroids[j$4]) {
	                        repeat = true;
	                        break;
	                    }
	                }

	                centroids = newCentroids;
	                nb_iters++;

	                if (nb_iters > 200) {
	                    repeat = false;
	                }
	            }

	            // finished k-means clustering
	            // the next part is borrowed from gabrielflor.it
	            var kClusters = {};
	            for (var j$5=0; j$5<num; j$5++) {
	                kClusters[j$5] = [];
	            }
	            for (var i$6=0; i$6<n; i$6++) {
	                cluster = assignments[i$6];
	                kClusters[cluster].push(values[i$6]);
	            }
	            var tmpKMeansBreaks = [];
	            for (var j$6=0; j$6<num; j$6++) {
	                tmpKMeansBreaks.push(kClusters[j$6][0]);
	                tmpKMeansBreaks.push(kClusters[j$6][kClusters[j$6].length-1]);
	            }
	            tmpKMeansBreaks = tmpKMeansBreaks.sort(function (a,b){ return a-b; });
	            limits.push(tmpKMeansBreaks[0]);
	            for (var i$7=1; i$7 < tmpKMeansBreaks.length; i$7+= 2) {
	                var v = tmpKMeansBreaks[i$7];
	                if (!isNaN(v) && (limits.indexOf(v) === -1)) {
	                    limits.push(v);
	                }
	            }
	        }
	        return limits;
	    };

	    var analyze_1 = {analyze: analyze, limits: limits};

	    var Color$3 = Color_1;


	    var contrast = function (a, b) {
	        // WCAG contrast ratio
	        // see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
	        a = new Color$3(a);
	        b = new Color$3(b);
	        var l1 = a.luminance();
	        var l2 = b.luminance();
	        return l1 > l2 ? (l1 + 0.05) / (l2 + 0.05) : (l2 + 0.05) / (l1 + 0.05);
	    };

	    var Color$2 = Color_1;
	    var sqrt = Math.sqrt;
	    var pow = Math.pow;
	    var min = Math.min;
	    var max = Math.max;
	    var atan2 = Math.atan2;
	    var abs = Math.abs;
	    var cos = Math.cos;
	    var sin = Math.sin;
	    var exp = Math.exp;
	    var PI = Math.PI;

	    var deltaE = function(a, b, Kl, Kc, Kh) {
	        if ( Kl === void 0 ) Kl=1;
	        if ( Kc === void 0 ) Kc=1;
	        if ( Kh === void 0 ) Kh=1;

	        // Delta E (CIE 2000)
	        // see http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html
	        var rad2deg = function(rad) {
	            return 360 * rad / (2 * PI);
	        };
	        var deg2rad = function(deg) {
	            return (2 * PI * deg) / 360;
	        };
	        a = new Color$2(a);
	        b = new Color$2(b);
	        var ref = Array.from(a.lab());
	        var L1 = ref[0];
	        var a1 = ref[1];
	        var b1 = ref[2];
	        var ref$1 = Array.from(b.lab());
	        var L2 = ref$1[0];
	        var a2 = ref$1[1];
	        var b2 = ref$1[2];
	        var avgL = (L1 + L2)/2;
	        var C1 = sqrt(pow(a1, 2) + pow(b1, 2));
	        var C2 = sqrt(pow(a2, 2) + pow(b2, 2));
	        var avgC = (C1 + C2)/2;
	        var G = 0.5*(1-sqrt(pow(avgC, 7)/(pow(avgC, 7) + pow(25, 7))));
	        var a1p = a1*(1+G);
	        var a2p = a2*(1+G);
	        var C1p = sqrt(pow(a1p, 2) + pow(b1, 2));
	        var C2p = sqrt(pow(a2p, 2) + pow(b2, 2));
	        var avgCp = (C1p + C2p)/2;
	        var arctan1 = rad2deg(atan2(b1, a1p));
	        var arctan2 = rad2deg(atan2(b2, a2p));
	        var h1p = arctan1 >= 0 ? arctan1 : arctan1 + 360;
	        var h2p = arctan2 >= 0 ? arctan2 : arctan2 + 360;
	        var avgHp = abs(h1p - h2p) > 180 ? (h1p + h2p + 360)/2 : (h1p + h2p)/2;
	        var T = 1 - 0.17*cos(deg2rad(avgHp - 30)) + 0.24*cos(deg2rad(2*avgHp)) + 0.32*cos(deg2rad(3*avgHp + 6)) - 0.2*cos(deg2rad(4*avgHp - 63));
	        var deltaHp = h2p - h1p;
	        deltaHp = abs(deltaHp) <= 180 ? deltaHp : h2p <= h1p ? deltaHp + 360 : deltaHp - 360;
	        deltaHp = 2*sqrt(C1p*C2p)*sin(deg2rad(deltaHp)/2);
	        var deltaL = L2 - L1;
	        var deltaCp = C2p - C1p;    
	        var sl = 1 + (0.015*pow(avgL - 50, 2))/sqrt(20 + pow(avgL - 50, 2));
	        var sc = 1 + 0.045*avgCp;
	        var sh = 1 + 0.015*avgCp*T;
	        var deltaTheta = 30*exp(-pow((avgHp - 275)/25, 2));
	        var Rc = 2*sqrt(pow(avgCp, 7)/(pow(avgCp, 7) + pow(25, 7)));
	        var Rt = -Rc*sin(2*deg2rad(deltaTheta));
	        var result = sqrt(pow(deltaL/(Kl*sl), 2) + pow(deltaCp/(Kc*sc), 2) + pow(deltaHp/(Kh*sh), 2) + Rt*(deltaCp/(Kc*sc))*(deltaHp/(Kh*sh)));
	        return max(0, min(100, result));
	    };

	    var Color$1 = Color_1;

	    // simple Euclidean distance
	    var distance = function(a, b, mode) {
	        if ( mode === void 0 ) mode='lab';

	        // Delta E (CIE 1976)
	        // see http://www.brucelindbloom.com/index.html?Equations.html
	        a = new Color$1(a);
	        b = new Color$1(b);
	        var l1 = a.get(mode);
	        var l2 = b.get(mode);
	        var sum_sq = 0;
	        for (var i in l1) {
	            var d = (l1[i] || 0) - (l2[i] || 0);
	            sum_sq += d*d;
	        }
	        return Math.sqrt(sum_sq);
	    };

	    var Color = Color_1;

	    var valid = function () {
	        var args = [], len = arguments.length;
	        while ( len-- ) args[ len ] = arguments[ len ];

	        try {
	            new (Function.prototype.bind.apply( Color, [ null ].concat( args) ));
	            return true;
	        } catch (e) {
	            return false;
	        }
	    };

	    // some pre-defined color scales:
	    var chroma$1 = chroma_1;

	    var scale = scale$2;

	    var scales = {
	    	cool: function cool() { return scale([chroma$1.hsl(180,1,.9), chroma$1.hsl(250,.7,.4)]) },
	    	hot: function hot() { return scale(['#000','#f00','#ff0','#fff']).mode('rgb') }
	    };

	    /**
	        ColorBrewer colors for chroma.js

	        Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The
	        Pennsylvania State University.

	        Licensed under the Apache License, Version 2.0 (the "License");
	        you may not use this file except in compliance with the License.
	        You may obtain a copy of the License at
	        http://www.apache.org/licenses/LICENSE-2.0

	        Unless required by applicable law or agreed to in writing, software distributed
	        under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
	        CONDITIONS OF ANY KIND, either express or implied. See the License for the
	        specific language governing permissions and limitations under the License.
	    */

	    var colorbrewer = {
	        // sequential
	        OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
	        PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
	        BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
	        Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
	        BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
	        YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
	        YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
	        Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
	        RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
	        Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
	        YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
	        Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
	        GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
	        Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
	        YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
	        PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
	        Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
	        PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
	        Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],

	        // diverging

	        Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
	        RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
	        RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
	        PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
	        PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
	        RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
	        BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
	        RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
	        PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],

	        // qualitative

	        Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
	        Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
	        Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
	        Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
	        Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
	        Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
	        Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
	        Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2'],
	    };

	    // add lowercase aliases for case-insensitive matches
	    for (var i = 0, list = Object.keys(colorbrewer); i < list.length; i += 1) {
	        var key = list[i];

	        colorbrewer[key.toLowerCase()] = colorbrewer[key];
	    }

	    var colorbrewer_1 = colorbrewer;

	    var chroma = chroma_1;

	    // feel free to comment out anything to rollup
	    // a smaller chroma.js built

	    // io --> convert colors

















	    // operators --> modify existing Colors










	    // interpolators












	    // generators -- > create new colors
	    chroma.average = average;
	    chroma.bezier = bezier_1;
	    chroma.blend = blend_1;
	    chroma.cubehelix = cubehelix;
	    chroma.mix = chroma.interpolate = mix$1;
	    chroma.random = random_1;
	    chroma.scale = scale$2;

	    // other utility methods
	    chroma.analyze = analyze_1.analyze;
	    chroma.contrast = contrast;
	    chroma.deltaE = deltaE;
	    chroma.distance = distance;
	    chroma.limits = analyze_1.limits;
	    chroma.valid = valid;

	    // scale
	    chroma.scales = scales;

	    // colors
	    chroma.colors = w3cx11_1;
	    chroma.brewer = colorbrewer_1;

	    var chroma_js = chroma;

	    return chroma_js;

	})); 
} (chroma$1));

var chromaExports = chroma$1.exports;
var chroma = /*@__PURE__*/getDefaultExportFromCjs(chromaExports);

function saturation(colors, amnt) {
    if (amnt === void 0) { amnt = 0; }
    return Object.fromEntries(Object.entries(colors)
        .map(function (_a) {
        var key = _a[0], val = _a[1];
        var update = amnt < 0 ?
            chroma(val).desaturate(amnt * -1) :
            chroma(val).saturate(amnt);
        return [key, update.toString()];
    }));
}
function getTheme(_a) {
    var defaultTheme = _a.defaultTheme, defaultColors = _a.defaultColors;
    return {
        extend: {
            animation: {
                'fade-in': 'fadeIn 500ms linear',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            fontFamily: {
                sans: __spreadArray(['Inter'], defaultTheme.fontFamily.sans, true),
            },
            colors: {
                primary: saturation(defaultColors.indigo, -2),
                secondary: saturation(defaultColors.sky, -.5),
                warning: saturation(defaultColors.orange, -1.5),
                danger: saturation(defaultColors.red, -.75),
                success: saturation(defaultColors.emerald, -1),
                disabled: defaultColors.zinc,
                fg: defaultColors.zinc,
                bg: defaultColors.zinc,
            },
            borderRadius: {
                '4xl': '2rem',
            },
            maxWidth: {
                '1/4': '25%',
                '1/3': '33.333%',
                '5/12': '41.666%',
                '1/2': '50%',
                '7/12': '58.333%',
                '2/3': '66.666%',
                '3/4': '75%',
            },
            maxHeight: {
                '1/4': '25%',
                '1/3': '33.333%',
                '5/12': '41.666%',
                '1/2': '50%',
                '7/12': '58.333%',
                '2/3': '66.666%',
                '3/4': '75%',
            },
            screens: {
                '800': '800px',
                '500': '500px',
            },
            opacity: {
                '1': '0.01',
                '2': '0.02',
                '4': '0.04',
                '6': '0.06',
                '8': '0.08',
            },
            backdropBlur: {
                '2xs': '1px',
                'xs': '2px',
            }
        }
    };
}
var safelist = [
    {
        pattern: /(divide|border|bg|text|ring|shadow|caret|accent)-(primary|secondary|warning|danger|success|disabled|fg|bg)-.*/,
        variants: [
            'hover', 'focus', 'disabled', 'invalid', 'dark',
            'dark:hover', 'darks:focus', 'dark:disabled', 'darks:invalid',
            'focus:invalid', 'hover:invalid'
        ]
    }
];

var react = {exports: {}};

var react_production_min = {};

/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReact_production_min;

function requireReact_production_min () {
	if (hasRequiredReact_production_min) return react_production_min;
	hasRequiredReact_production_min = 1;
var l=Symbol.for("react.element"),n=Symbol.for("react.portal"),p=Symbol.for("react.fragment"),q=Symbol.for("react.strict_mode"),r=Symbol.for("react.profiler"),t=Symbol.for("react.provider"),u=Symbol.for("react.context"),v=Symbol.for("react.forward_ref"),w=Symbol.for("react.suspense"),x=Symbol.for("react.memo"),y=Symbol.for("react.lazy"),z=Symbol.iterator;function A(a){if(null===a||"object"!==typeof a)return null;a=z&&a[z]||a["@@iterator"];return "function"===typeof a?a:null}
	var B={isMounted:function(){return !1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},C=Object.assign,D={};function E(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B;}E.prototype.isReactComponent={};
	E.prototype.setState=function(a,b){if("object"!==typeof a&&"function"!==typeof a&&null!=a)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,a,b,"setState");};E.prototype.forceUpdate=function(a){this.updater.enqueueForceUpdate(this,a,"forceUpdate");};function F(){}F.prototype=E.prototype;function G(a,b,e){this.props=a;this.context=b;this.refs=D;this.updater=e||B;}var H=G.prototype=new F;
	H.constructor=G;C(H,E.prototype);H.isPureReactComponent=!0;var I=Array.isArray,J=Object.prototype.hasOwnProperty,K={current:null},L={key:!0,ref:!0,__self:!0,__source:!0};
	function M(a,b,e){var d,c={},k=null,h=null;if(null!=b)for(d in void 0!==b.ref&&(h=b.ref),void 0!==b.key&&(k=""+b.key),b)J.call(b,d)&&!L.hasOwnProperty(d)&&(c[d]=b[d]);var g=arguments.length-2;if(1===g)c.children=e;else if(1<g){for(var f=Array(g),m=0;m<g;m++)f[m]=arguments[m+2];c.children=f;}if(a&&a.defaultProps)for(d in g=a.defaultProps,g)void 0===c[d]&&(c[d]=g[d]);return {$$typeof:l,type:a,key:k,ref:h,props:c,_owner:K.current}}
	function N(a,b){return {$$typeof:l,type:a.type,key:b,ref:a.ref,props:a.props,_owner:a._owner}}function O(a){return "object"===typeof a&&null!==a&&a.$$typeof===l}function escape(a){var b={"=":"=0",":":"=2"};return "$"+a.replace(/[=:]/g,function(a){return b[a]})}var P=/\/+/g;function Q(a,b){return "object"===typeof a&&null!==a&&null!=a.key?escape(""+a.key):b.toString(36)}
	function R(a,b,e,d,c){var k=typeof a;if("undefined"===k||"boolean"===k)a=null;var h=!1;if(null===a)h=!0;else switch(k){case "string":case "number":h=!0;break;case "object":switch(a.$$typeof){case l:case n:h=!0;}}if(h)return h=a,c=c(h),a=""===d?"."+Q(h,0):d,I(c)?(e="",null!=a&&(e=a.replace(P,"$&/")+"/"),R(c,b,e,"",function(a){return a})):null!=c&&(O(c)&&(c=N(c,e+(!c.key||h&&h.key===c.key?"":(""+c.key).replace(P,"$&/")+"/")+a)),b.push(c)),1;h=0;d=""===d?".":d+":";if(I(a))for(var g=0;g<a.length;g++){k=
	a[g];var f=d+Q(k,g);h+=R(k,b,e,f,c);}else if(f=A(a),"function"===typeof f)for(a=f.call(a),g=0;!(k=a.next()).done;)k=k.value,f=d+Q(k,g++),h+=R(k,b,e,f,c);else if("object"===k)throw b=String(a),Error("Objects are not valid as a React child (found: "+("[object Object]"===b?"object with keys {"+Object.keys(a).join(", ")+"}":b)+"). If you meant to render a collection of children, use an array instead.");return h}
	function S(a,b,e){if(null==a)return a;var d=[],c=0;R(a,d,"","",function(a){return b.call(e,a,c++)});return d}function T(a){if(-1===a._status){var b=a._result;b=b();b.then(function(b){if(0===a._status||-1===a._status)a._status=1,a._result=b;},function(b){if(0===a._status||-1===a._status)a._status=2,a._result=b;});-1===a._status&&(a._status=0,a._result=b);}if(1===a._status)return a._result.default;throw a._result;}
	var U={current:null},V={transition:null},W={ReactCurrentDispatcher:U,ReactCurrentBatchConfig:V,ReactCurrentOwner:K};react_production_min.Children={map:S,forEach:function(a,b,e){S(a,function(){b.apply(this,arguments);},e);},count:function(a){var b=0;S(a,function(){b++;});return b},toArray:function(a){return S(a,function(a){return a})||[]},only:function(a){if(!O(a))throw Error("React.Children.only expected to receive a single React element child.");return a}};react_production_min.Component=E;react_production_min.Fragment=p;
	react_production_min.Profiler=r;react_production_min.PureComponent=G;react_production_min.StrictMode=q;react_production_min.Suspense=w;react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=W;
	react_production_min.cloneElement=function(a,b,e){if(null===a||void 0===a)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+a+".");var d=C({},a.props),c=a.key,k=a.ref,h=a._owner;if(null!=b){void 0!==b.ref&&(k=b.ref,h=K.current);void 0!==b.key&&(c=""+b.key);if(a.type&&a.type.defaultProps)var g=a.type.defaultProps;for(f in b)J.call(b,f)&&!L.hasOwnProperty(f)&&(d[f]=void 0===b[f]&&void 0!==g?g[f]:b[f]);}var f=arguments.length-2;if(1===f)d.children=e;else if(1<f){g=Array(f);
	for(var m=0;m<f;m++)g[m]=arguments[m+2];d.children=g;}return {$$typeof:l,type:a.type,key:c,ref:k,props:d,_owner:h}};react_production_min.createContext=function(a){a={$$typeof:u,_currentValue:a,_currentValue2:a,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null};a.Provider={$$typeof:t,_context:a};return a.Consumer=a};react_production_min.createElement=M;react_production_min.createFactory=function(a){var b=M.bind(null,a);b.type=a;return b};react_production_min.createRef=function(){return {current:null}};
	react_production_min.forwardRef=function(a){return {$$typeof:v,render:a}};react_production_min.isValidElement=O;react_production_min.lazy=function(a){return {$$typeof:y,_payload:{_status:-1,_result:a},_init:T}};react_production_min.memo=function(a,b){return {$$typeof:x,type:a,compare:void 0===b?null:b}};react_production_min.startTransition=function(a){var b=V.transition;V.transition={};try{a();}finally{V.transition=b;}};react_production_min.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.");};
	react_production_min.useCallback=function(a,b){return U.current.useCallback(a,b)};react_production_min.useContext=function(a){return U.current.useContext(a)};react_production_min.useDebugValue=function(){};react_production_min.useDeferredValue=function(a){return U.current.useDeferredValue(a)};react_production_min.useEffect=function(a,b){return U.current.useEffect(a,b)};react_production_min.useId=function(){return U.current.useId()};react_production_min.useImperativeHandle=function(a,b,e){return U.current.useImperativeHandle(a,b,e)};
	react_production_min.useInsertionEffect=function(a,b){return U.current.useInsertionEffect(a,b)};react_production_min.useLayoutEffect=function(a,b){return U.current.useLayoutEffect(a,b)};react_production_min.useMemo=function(a,b){return U.current.useMemo(a,b)};react_production_min.useReducer=function(a,b,e){return U.current.useReducer(a,b,e)};react_production_min.useRef=function(a){return U.current.useRef(a)};react_production_min.useState=function(a){return U.current.useState(a)};react_production_min.useSyncExternalStore=function(a,b,e){return U.current.useSyncExternalStore(a,b,e)};
	react_production_min.useTransition=function(){return U.current.useTransition()};react_production_min.version="18.2.0";
	return react_production_min;
}

var react_development = {exports: {}};

/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
react_development.exports;

var hasRequiredReact_development;

function requireReact_development () {
	if (hasRequiredReact_development) return react_development.exports;
	hasRequiredReact_development = 1;
	(function (module, exports) {

		if (process.env.NODE_ENV !== "production") {
		  (function() {

		/* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
		if (
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart ===
		    'function'
		) {
		  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
		}
		          var ReactVersion = '18.2.0';

		// ATTENTION
		// When adding new symbols to this file,
		// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
		// The Symbol used to tag the ReactElement-like types.
		var REACT_ELEMENT_TYPE = Symbol.for('react.element');
		var REACT_PORTAL_TYPE = Symbol.for('react.portal');
		var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
		var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
		var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
		var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
		var REACT_CONTEXT_TYPE = Symbol.for('react.context');
		var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
		var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
		var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
		var REACT_MEMO_TYPE = Symbol.for('react.memo');
		var REACT_LAZY_TYPE = Symbol.for('react.lazy');
		var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
		var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
		var FAUX_ITERATOR_SYMBOL = '@@iterator';
		function getIteratorFn(maybeIterable) {
		  if (maybeIterable === null || typeof maybeIterable !== 'object') {
		    return null;
		  }

		  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

		  if (typeof maybeIterator === 'function') {
		    return maybeIterator;
		  }

		  return null;
		}

		/**
		 * Keeps track of the current dispatcher.
		 */
		var ReactCurrentDispatcher = {
		  /**
		   * @internal
		   * @type {ReactComponent}
		   */
		  current: null
		};

		/**
		 * Keeps track of the current batch's configuration such as how long an update
		 * should suspend for if it needs to.
		 */
		var ReactCurrentBatchConfig = {
		  transition: null
		};

		var ReactCurrentActQueue = {
		  current: null,
		  // Used to reproduce behavior of `batchedUpdates` in legacy mode.
		  isBatchingLegacy: false,
		  didScheduleLegacyUpdate: false
		};

		/**
		 * Keeps track of the current owner.
		 *
		 * The current owner is the component who should own any components that are
		 * currently being constructed.
		 */
		var ReactCurrentOwner = {
		  /**
		   * @internal
		   * @type {ReactComponent}
		   */
		  current: null
		};

		var ReactDebugCurrentFrame = {};
		var currentExtraStackFrame = null;
		function setExtraStackFrame(stack) {
		  {
		    currentExtraStackFrame = stack;
		  }
		}

		{
		  ReactDebugCurrentFrame.setExtraStackFrame = function (stack) {
		    {
		      currentExtraStackFrame = stack;
		    }
		  }; // Stack implementation injected by the current renderer.


		  ReactDebugCurrentFrame.getCurrentStack = null;

		  ReactDebugCurrentFrame.getStackAddendum = function () {
		    var stack = ''; // Add an extra top frame while an element is being validated

		    if (currentExtraStackFrame) {
		      stack += currentExtraStackFrame;
		    } // Delegate to the injected renderer-specific implementation


		    var impl = ReactDebugCurrentFrame.getCurrentStack;

		    if (impl) {
		      stack += impl() || '';
		    }

		    return stack;
		  };
		}

		// -----------------------------------------------------------------------------

		var enableScopeAPI = false; // Experimental Create Event Handle API.
		var enableCacheElement = false;
		var enableTransitionTracing = false; // No known bugs, but needs performance testing

		var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
		// stuff. Intended to enable React core members to more easily debug scheduling
		// issues in DEV builds.

		var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

		var ReactSharedInternals = {
		  ReactCurrentDispatcher: ReactCurrentDispatcher,
		  ReactCurrentBatchConfig: ReactCurrentBatchConfig,
		  ReactCurrentOwner: ReactCurrentOwner
		};

		{
		  ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
		  ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
		}

		// by calls to these methods by a Babel plugin.
		//
		// In PROD (or in packages without access to React internals),
		// they are left as they are instead.

		function warn(format) {
		  {
		    {
		      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		        args[_key - 1] = arguments[_key];
		      }

		      printWarning('warn', format, args);
		    }
		  }
		}
		function error(format) {
		  {
		    {
		      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
		        args[_key2 - 1] = arguments[_key2];
		      }

		      printWarning('error', format, args);
		    }
		  }
		}

		function printWarning(level, format, args) {
		  // When changing this logic, you might want to also
		  // update consoleWithStackDev.www.js as well.
		  {
		    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
		    var stack = ReactDebugCurrentFrame.getStackAddendum();

		    if (stack !== '') {
		      format += '%s';
		      args = args.concat([stack]);
		    } // eslint-disable-next-line react-internal/safe-string-coercion


		    var argsWithFormat = args.map(function (item) {
		      return String(item);
		    }); // Careful: RN currently depends on this prefix

		    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
		    // breaks IE9: https://github.com/facebook/react/issues/13610
		    // eslint-disable-next-line react-internal/no-production-logging

		    Function.prototype.apply.call(console[level], console, argsWithFormat);
		  }
		}

		var didWarnStateUpdateForUnmountedComponent = {};

		function warnNoop(publicInstance, callerName) {
		  {
		    var _constructor = publicInstance.constructor;
		    var componentName = _constructor && (_constructor.displayName || _constructor.name) || 'ReactClass';
		    var warningKey = componentName + "." + callerName;

		    if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
		      return;
		    }

		    error("Can't call %s on a component that is not yet mounted. " + 'This is a no-op, but it might indicate a bug in your application. ' + 'Instead, assign to `this.state` directly or define a `state = {};` ' + 'class property with the desired state in the %s component.', callerName, componentName);

		    didWarnStateUpdateForUnmountedComponent[warningKey] = true;
		  }
		}
		/**
		 * This is the abstract API for an update queue.
		 */


		var ReactNoopUpdateQueue = {
		  /**
		   * Checks whether or not this composite component is mounted.
		   * @param {ReactClass} publicInstance The instance we want to test.
		   * @return {boolean} True if mounted, false otherwise.
		   * @protected
		   * @final
		   */
		  isMounted: function (publicInstance) {
		    return false;
		  },

		  /**
		   * Forces an update. This should only be invoked when it is known with
		   * certainty that we are **not** in a DOM transaction.
		   *
		   * You may want to call this when you know that some deeper aspect of the
		   * component's state has changed but `setState` was not called.
		   *
		   * This will not invoke `shouldComponentUpdate`, but it will invoke
		   * `componentWillUpdate` and `componentDidUpdate`.
		   *
		   * @param {ReactClass} publicInstance The instance that should rerender.
		   * @param {?function} callback Called after component is updated.
		   * @param {?string} callerName name of the calling function in the public API.
		   * @internal
		   */
		  enqueueForceUpdate: function (publicInstance, callback, callerName) {
		    warnNoop(publicInstance, 'forceUpdate');
		  },

		  /**
		   * Replaces all of the state. Always use this or `setState` to mutate state.
		   * You should treat `this.state` as immutable.
		   *
		   * There is no guarantee that `this.state` will be immediately updated, so
		   * accessing `this.state` after calling this method may return the old value.
		   *
		   * @param {ReactClass} publicInstance The instance that should rerender.
		   * @param {object} completeState Next state.
		   * @param {?function} callback Called after component is updated.
		   * @param {?string} callerName name of the calling function in the public API.
		   * @internal
		   */
		  enqueueReplaceState: function (publicInstance, completeState, callback, callerName) {
		    warnNoop(publicInstance, 'replaceState');
		  },

		  /**
		   * Sets a subset of the state. This only exists because _pendingState is
		   * internal. This provides a merging strategy that is not available to deep
		   * properties which is confusing. TODO: Expose pendingState or don't use it
		   * during the merge.
		   *
		   * @param {ReactClass} publicInstance The instance that should rerender.
		   * @param {object} partialState Next partial state to be merged with state.
		   * @param {?function} callback Called after component is updated.
		   * @param {?string} Name of the calling function in the public API.
		   * @internal
		   */
		  enqueueSetState: function (publicInstance, partialState, callback, callerName) {
		    warnNoop(publicInstance, 'setState');
		  }
		};

		var assign = Object.assign;

		var emptyObject = {};

		{
		  Object.freeze(emptyObject);
		}
		/**
		 * Base class helpers for the updating state of a component.
		 */


		function Component(props, context, updater) {
		  this.props = props;
		  this.context = context; // If a component has string refs, we will assign a different object later.

		  this.refs = emptyObject; // We initialize the default updater but the real one gets injected by the
		  // renderer.

		  this.updater = updater || ReactNoopUpdateQueue;
		}

		Component.prototype.isReactComponent = {};
		/**
		 * Sets a subset of the state. Always use this to mutate
		 * state. You should treat `this.state` as immutable.
		 *
		 * There is no guarantee that `this.state` will be immediately updated, so
		 * accessing `this.state` after calling this method may return the old value.
		 *
		 * There is no guarantee that calls to `setState` will run synchronously,
		 * as they may eventually be batched together.  You can provide an optional
		 * callback that will be executed when the call to setState is actually
		 * completed.
		 *
		 * When a function is provided to setState, it will be called at some point in
		 * the future (not synchronously). It will be called with the up to date
		 * component arguments (state, props, context). These values can be different
		 * from this.* because your function may be called after receiveProps but before
		 * shouldComponentUpdate, and this new state, props, and context will not yet be
		 * assigned to this.
		 *
		 * @param {object|function} partialState Next partial state or function to
		 *        produce next partial state to be merged with current state.
		 * @param {?function} callback Called after state is updated.
		 * @final
		 * @protected
		 */

		Component.prototype.setState = function (partialState, callback) {
		  if (typeof partialState !== 'object' && typeof partialState !== 'function' && partialState != null) {
		    throw new Error('setState(...): takes an object of state variables to update or a ' + 'function which returns an object of state variables.');
		  }

		  this.updater.enqueueSetState(this, partialState, callback, 'setState');
		};
		/**
		 * Forces an update. This should only be invoked when it is known with
		 * certainty that we are **not** in a DOM transaction.
		 *
		 * You may want to call this when you know that some deeper aspect of the
		 * component's state has changed but `setState` was not called.
		 *
		 * This will not invoke `shouldComponentUpdate`, but it will invoke
		 * `componentWillUpdate` and `componentDidUpdate`.
		 *
		 * @param {?function} callback Called after update is complete.
		 * @final
		 * @protected
		 */


		Component.prototype.forceUpdate = function (callback) {
		  this.updater.enqueueForceUpdate(this, callback, 'forceUpdate');
		};
		/**
		 * Deprecated APIs. These APIs used to exist on classic React classes but since
		 * we would like to deprecate them, we're not going to move them over to this
		 * modern base class. Instead, we define a getter that warns if it's accessed.
		 */


		{
		  var deprecatedAPIs = {
		    isMounted: ['isMounted', 'Instead, make sure to clean up subscriptions and pending requests in ' + 'componentWillUnmount to prevent memory leaks.'],
		    replaceState: ['replaceState', 'Refactor your code to use setState instead (see ' + 'https://github.com/facebook/react/issues/3236).']
		  };

		  var defineDeprecationWarning = function (methodName, info) {
		    Object.defineProperty(Component.prototype, methodName, {
		      get: function () {
		        warn('%s(...) is deprecated in plain JavaScript React classes. %s', info[0], info[1]);

		        return undefined;
		      }
		    });
		  };

		  for (var fnName in deprecatedAPIs) {
		    if (deprecatedAPIs.hasOwnProperty(fnName)) {
		      defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
		    }
		  }
		}

		function ComponentDummy() {}

		ComponentDummy.prototype = Component.prototype;
		/**
		 * Convenience component with default shallow equality check for sCU.
		 */

		function PureComponent(props, context, updater) {
		  this.props = props;
		  this.context = context; // If a component has string refs, we will assign a different object later.

		  this.refs = emptyObject;
		  this.updater = updater || ReactNoopUpdateQueue;
		}

		var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
		pureComponentPrototype.constructor = PureComponent; // Avoid an extra prototype jump for these methods.

		assign(pureComponentPrototype, Component.prototype);
		pureComponentPrototype.isPureReactComponent = true;

		// an immutable object with a single mutable value
		function createRef() {
		  var refObject = {
		    current: null
		  };

		  {
		    Object.seal(refObject);
		  }

		  return refObject;
		}

		var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

		function isArray(a) {
		  return isArrayImpl(a);
		}

		/*
		 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
		 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
		 *
		 * The functions in this module will throw an easier-to-understand,
		 * easier-to-debug exception with a clear errors message message explaining the
		 * problem. (Instead of a confusing exception thrown inside the implementation
		 * of the `value` object).
		 */
		// $FlowFixMe only called in DEV, so void return is not possible.
		function typeName(value) {
		  {
		    // toStringTag is needed for namespaced types like Temporal.Instant
		    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
		    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
		    return type;
		  }
		} // $FlowFixMe only called in DEV, so void return is not possible.


		function willCoercionThrow(value) {
		  {
		    try {
		      testStringCoercion(value);
		      return false;
		    } catch (e) {
		      return true;
		    }
		  }
		}

		function testStringCoercion(value) {
		  // If you ended up here by following an exception call stack, here's what's
		  // happened: you supplied an object or symbol value to React (as a prop, key,
		  // DOM attribute, CSS property, string ref, etc.) and when React tried to
		  // coerce it to a string using `'' + value`, an exception was thrown.
		  //
		  // The most common types that will cause this exception are `Symbol` instances
		  // and Temporal objects like `Temporal.Instant`. But any object that has a
		  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
		  // exception. (Library authors do this to prevent users from using built-in
		  // numeric operators like `+` or comparison operators like `>=` because custom
		  // methods are needed to perform accurate arithmetic or comparison.)
		  //
		  // To fix the problem, coerce this object or symbol value to a string before
		  // passing it to React. The most reliable way is usually `String(value)`.
		  //
		  // To find which value is throwing, check the browser or debugger console.
		  // Before this exception was thrown, there should be `console.error` output
		  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
		  // problem and how that type was used: key, atrribute, input value prop, etc.
		  // In most cases, this console output also shows the component and its
		  // ancestor components where the exception happened.
		  //
		  // eslint-disable-next-line react-internal/safe-string-coercion
		  return '' + value;
		}
		function checkKeyStringCoercion(value) {
		  {
		    if (willCoercionThrow(value)) {
		      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

		      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
		    }
		  }
		}

		function getWrappedName(outerType, innerType, wrapperName) {
		  var displayName = outerType.displayName;

		  if (displayName) {
		    return displayName;
		  }

		  var functionName = innerType.displayName || innerType.name || '';
		  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
		} // Keep in sync with react-reconciler/getComponentNameFromFiber


		function getContextName(type) {
		  return type.displayName || 'Context';
		} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


		function getComponentNameFromType(type) {
		  if (type == null) {
		    // Host root, text node or just invalid type.
		    return null;
		  }

		  {
		    if (typeof type.tag === 'number') {
		      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
		    }
		  }

		  if (typeof type === 'function') {
		    return type.displayName || type.name || null;
		  }

		  if (typeof type === 'string') {
		    return type;
		  }

		  switch (type) {
		    case REACT_FRAGMENT_TYPE:
		      return 'Fragment';

		    case REACT_PORTAL_TYPE:
		      return 'Portal';

		    case REACT_PROFILER_TYPE:
		      return 'Profiler';

		    case REACT_STRICT_MODE_TYPE:
		      return 'StrictMode';

		    case REACT_SUSPENSE_TYPE:
		      return 'Suspense';

		    case REACT_SUSPENSE_LIST_TYPE:
		      return 'SuspenseList';

		  }

		  if (typeof type === 'object') {
		    switch (type.$$typeof) {
		      case REACT_CONTEXT_TYPE:
		        var context = type;
		        return getContextName(context) + '.Consumer';

		      case REACT_PROVIDER_TYPE:
		        var provider = type;
		        return getContextName(provider._context) + '.Provider';

		      case REACT_FORWARD_REF_TYPE:
		        return getWrappedName(type, type.render, 'ForwardRef');

		      case REACT_MEMO_TYPE:
		        var outerName = type.displayName || null;

		        if (outerName !== null) {
		          return outerName;
		        }

		        return getComponentNameFromType(type.type) || 'Memo';

		      case REACT_LAZY_TYPE:
		        {
		          var lazyComponent = type;
		          var payload = lazyComponent._payload;
		          var init = lazyComponent._init;

		          try {
		            return getComponentNameFromType(init(payload));
		          } catch (x) {
		            return null;
		          }
		        }

		      // eslint-disable-next-line no-fallthrough
		    }
		  }

		  return null;
		}

		var hasOwnProperty = Object.prototype.hasOwnProperty;

		var RESERVED_PROPS = {
		  key: true,
		  ref: true,
		  __self: true,
		  __source: true
		};
		var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;

		{
		  didWarnAboutStringRefs = {};
		}

		function hasValidRef(config) {
		  {
		    if (hasOwnProperty.call(config, 'ref')) {
		      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

		      if (getter && getter.isReactWarning) {
		        return false;
		      }
		    }
		  }

		  return config.ref !== undefined;
		}

		function hasValidKey(config) {
		  {
		    if (hasOwnProperty.call(config, 'key')) {
		      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

		      if (getter && getter.isReactWarning) {
		        return false;
		      }
		    }
		  }

		  return config.key !== undefined;
		}

		function defineKeyPropWarningGetter(props, displayName) {
		  var warnAboutAccessingKey = function () {
		    {
		      if (!specialPropKeyWarningShown) {
		        specialPropKeyWarningShown = true;

		        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
		      }
		    }
		  };

		  warnAboutAccessingKey.isReactWarning = true;
		  Object.defineProperty(props, 'key', {
		    get: warnAboutAccessingKey,
		    configurable: true
		  });
		}

		function defineRefPropWarningGetter(props, displayName) {
		  var warnAboutAccessingRef = function () {
		    {
		      if (!specialPropRefWarningShown) {
		        specialPropRefWarningShown = true;

		        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
		      }
		    }
		  };

		  warnAboutAccessingRef.isReactWarning = true;
		  Object.defineProperty(props, 'ref', {
		    get: warnAboutAccessingRef,
		    configurable: true
		  });
		}

		function warnIfStringRefCannotBeAutoConverted(config) {
		  {
		    if (typeof config.ref === 'string' && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
		      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

		      if (!didWarnAboutStringRefs[componentName]) {
		        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);

		        didWarnAboutStringRefs[componentName] = true;
		      }
		    }
		  }
		}
		/**
		 * Factory method to create a new React element. This no longer adheres to
		 * the class pattern, so do not use new to call it. Also, instanceof check
		 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
		 * if something is a React Element.
		 *
		 * @param {*} type
		 * @param {*} props
		 * @param {*} key
		 * @param {string|object} ref
		 * @param {*} owner
		 * @param {*} self A *temporary* helper to detect places where `this` is
		 * different from the `owner` when React.createElement is called, so that we
		 * can warn. We want to get rid of owner and replace string `ref`s with arrow
		 * functions, and as long as `this` and owner are the same, there will be no
		 * change in behavior.
		 * @param {*} source An annotation object (added by a transpiler or otherwise)
		 * indicating filename, line number, and/or other information.
		 * @internal
		 */


		var ReactElement = function (type, key, ref, self, source, owner, props) {
		  var element = {
		    // This tag allows us to uniquely identify this as a React Element
		    $$typeof: REACT_ELEMENT_TYPE,
		    // Built-in properties that belong on the element
		    type: type,
		    key: key,
		    ref: ref,
		    props: props,
		    // Record the component responsible for creating this element.
		    _owner: owner
		  };

		  {
		    // The validation flag is currently mutative. We put it on
		    // an external backing store so that we can freeze the whole object.
		    // This can be replaced with a WeakMap once they are implemented in
		    // commonly used development environments.
		    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
		    // the validation flag non-enumerable (where possible, which should
		    // include every environment we run tests in), so the test framework
		    // ignores it.

		    Object.defineProperty(element._store, 'validated', {
		      configurable: false,
		      enumerable: false,
		      writable: true,
		      value: false
		    }); // self and source are DEV only properties.

		    Object.defineProperty(element, '_self', {
		      configurable: false,
		      enumerable: false,
		      writable: false,
		      value: self
		    }); // Two elements created in two different places should be considered
		    // equal for testing purposes and therefore we hide it from enumeration.

		    Object.defineProperty(element, '_source', {
		      configurable: false,
		      enumerable: false,
		      writable: false,
		      value: source
		    });

		    if (Object.freeze) {
		      Object.freeze(element.props);
		      Object.freeze(element);
		    }
		  }

		  return element;
		};
		/**
		 * Create and return a new ReactElement of the given type.
		 * See https://reactjs.org/docs/react-api.html#createelement
		 */

		function createElement(type, config, children) {
		  var propName; // Reserved names are extracted

		  var props = {};
		  var key = null;
		  var ref = null;
		  var self = null;
		  var source = null;

		  if (config != null) {
		    if (hasValidRef(config)) {
		      ref = config.ref;

		      {
		        warnIfStringRefCannotBeAutoConverted(config);
		      }
		    }

		    if (hasValidKey(config)) {
		      {
		        checkKeyStringCoercion(config.key);
		      }

		      key = '' + config.key;
		    }

		    self = config.__self === undefined ? null : config.__self;
		    source = config.__source === undefined ? null : config.__source; // Remaining properties are added to a new props object

		    for (propName in config) {
		      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
		        props[propName] = config[propName];
		      }
		    }
		  } // Children can be more than one argument, and those are transferred onto
		  // the newly allocated props object.


		  var childrenLength = arguments.length - 2;

		  if (childrenLength === 1) {
		    props.children = children;
		  } else if (childrenLength > 1) {
		    var childArray = Array(childrenLength);

		    for (var i = 0; i < childrenLength; i++) {
		      childArray[i] = arguments[i + 2];
		    }

		    {
		      if (Object.freeze) {
		        Object.freeze(childArray);
		      }
		    }

		    props.children = childArray;
		  } // Resolve default props


		  if (type && type.defaultProps) {
		    var defaultProps = type.defaultProps;

		    for (propName in defaultProps) {
		      if (props[propName] === undefined) {
		        props[propName] = defaultProps[propName];
		      }
		    }
		  }

		  {
		    if (key || ref) {
		      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

		      if (key) {
		        defineKeyPropWarningGetter(props, displayName);
		      }

		      if (ref) {
		        defineRefPropWarningGetter(props, displayName);
		      }
		    }
		  }

		  return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
		}
		function cloneAndReplaceKey(oldElement, newKey) {
		  var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
		  return newElement;
		}
		/**
		 * Clone and return a new ReactElement using element as the starting point.
		 * See https://reactjs.org/docs/react-api.html#cloneelement
		 */

		function cloneElement(element, config, children) {
		  if (element === null || element === undefined) {
		    throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
		  }

		  var propName; // Original props are copied

		  var props = assign({}, element.props); // Reserved names are extracted

		  var key = element.key;
		  var ref = element.ref; // Self is preserved since the owner is preserved.

		  var self = element._self; // Source is preserved since cloneElement is unlikely to be targeted by a
		  // transpiler, and the original source is probably a better indicator of the
		  // true owner.

		  var source = element._source; // Owner will be preserved, unless ref is overridden

		  var owner = element._owner;

		  if (config != null) {
		    if (hasValidRef(config)) {
		      // Silently steal the ref from the parent.
		      ref = config.ref;
		      owner = ReactCurrentOwner.current;
		    }

		    if (hasValidKey(config)) {
		      {
		        checkKeyStringCoercion(config.key);
		      }

		      key = '' + config.key;
		    } // Remaining properties override existing props


		    var defaultProps;

		    if (element.type && element.type.defaultProps) {
		      defaultProps = element.type.defaultProps;
		    }

		    for (propName in config) {
		      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
		        if (config[propName] === undefined && defaultProps !== undefined) {
		          // Resolve default props
		          props[propName] = defaultProps[propName];
		        } else {
		          props[propName] = config[propName];
		        }
		      }
		    }
		  } // Children can be more than one argument, and those are transferred onto
		  // the newly allocated props object.


		  var childrenLength = arguments.length - 2;

		  if (childrenLength === 1) {
		    props.children = children;
		  } else if (childrenLength > 1) {
		    var childArray = Array(childrenLength);

		    for (var i = 0; i < childrenLength; i++) {
		      childArray[i] = arguments[i + 2];
		    }

		    props.children = childArray;
		  }

		  return ReactElement(element.type, key, ref, self, source, owner, props);
		}
		/**
		 * Verifies the object is a ReactElement.
		 * See https://reactjs.org/docs/react-api.html#isvalidelement
		 * @param {?object} object
		 * @return {boolean} True if `object` is a ReactElement.
		 * @final
		 */

		function isValidElement(object) {
		  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
		}

		var SEPARATOR = '.';
		var SUBSEPARATOR = ':';
		/**
		 * Escape and wrap key so it is safe to use as a reactid
		 *
		 * @param {string} key to be escaped.
		 * @return {string} the escaped key.
		 */

		function escape(key) {
		  var escapeRegex = /[=:]/g;
		  var escaperLookup = {
		    '=': '=0',
		    ':': '=2'
		  };
		  var escapedString = key.replace(escapeRegex, function (match) {
		    return escaperLookup[match];
		  });
		  return '$' + escapedString;
		}
		/**
		 * TODO: Test that a single child and an array with one item have the same key
		 * pattern.
		 */


		var didWarnAboutMaps = false;
		var userProvidedKeyEscapeRegex = /\/+/g;

		function escapeUserProvidedKey(text) {
		  return text.replace(userProvidedKeyEscapeRegex, '$&/');
		}
		/**
		 * Generate a key string that identifies a element within a set.
		 *
		 * @param {*} element A element that could contain a manual key.
		 * @param {number} index Index that is used if a manual key is not provided.
		 * @return {string}
		 */


		function getElementKey(element, index) {
		  // Do some typechecking here since we call this blindly. We want to ensure
		  // that we don't block potential future ES APIs.
		  if (typeof element === 'object' && element !== null && element.key != null) {
		    // Explicit key
		    {
		      checkKeyStringCoercion(element.key);
		    }

		    return escape('' + element.key);
		  } // Implicit key determined by the index in the set


		  return index.toString(36);
		}

		function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		  var type = typeof children;

		  if (type === 'undefined' || type === 'boolean') {
		    // All of the above are perceived as null.
		    children = null;
		  }

		  var invokeCallback = false;

		  if (children === null) {
		    invokeCallback = true;
		  } else {
		    switch (type) {
		      case 'string':
		      case 'number':
		        invokeCallback = true;
		        break;

		      case 'object':
		        switch (children.$$typeof) {
		          case REACT_ELEMENT_TYPE:
		          case REACT_PORTAL_TYPE:
		            invokeCallback = true;
		        }

		    }
		  }

		  if (invokeCallback) {
		    var _child = children;
		    var mappedChild = callback(_child); // If it's the only child, treat the name as if it was wrapped in an array
		    // so that it's consistent if the number of children grows:

		    var childKey = nameSoFar === '' ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;

		    if (isArray(mappedChild)) {
		      var escapedChildKey = '';

		      if (childKey != null) {
		        escapedChildKey = escapeUserProvidedKey(childKey) + '/';
		      }

		      mapIntoArray(mappedChild, array, escapedChildKey, '', function (c) {
		        return c;
		      });
		    } else if (mappedChild != null) {
		      if (isValidElement(mappedChild)) {
		        {
		          // The `if` statement here prevents auto-disabling of the safe
		          // coercion ESLint rule, so we must manually disable it below.
		          // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
		          if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
		            checkKeyStringCoercion(mappedChild.key);
		          }
		        }

		        mappedChild = cloneAndReplaceKey(mappedChild, // Keep both the (mapped) and old keys if they differ, just as
		        // traverseAllChildren used to do for objects as children
		        escapedPrefix + ( // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
		        mappedChild.key && (!_child || _child.key !== mappedChild.key) ? // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
		        // eslint-disable-next-line react-internal/safe-string-coercion
		        escapeUserProvidedKey('' + mappedChild.key) + '/' : '') + childKey);
		      }

		      array.push(mappedChild);
		    }

		    return 1;
		  }

		  var child;
		  var nextName;
		  var subtreeCount = 0; // Count of children found in the current subtree.

		  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

		  if (isArray(children)) {
		    for (var i = 0; i < children.length; i++) {
		      child = children[i];
		      nextName = nextNamePrefix + getElementKey(child, i);
		      subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
		    }
		  } else {
		    var iteratorFn = getIteratorFn(children);

		    if (typeof iteratorFn === 'function') {
		      var iterableChildren = children;

		      {
		        // Warn about using Maps as children
		        if (iteratorFn === iterableChildren.entries) {
		          if (!didWarnAboutMaps) {
		            warn('Using Maps as children is not supported. ' + 'Use an array of keyed ReactElements instead.');
		          }

		          didWarnAboutMaps = true;
		        }
		      }

		      var iterator = iteratorFn.call(iterableChildren);
		      var step;
		      var ii = 0;

		      while (!(step = iterator.next()).done) {
		        child = step.value;
		        nextName = nextNamePrefix + getElementKey(child, ii++);
		        subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
		      }
		    } else if (type === 'object') {
		      // eslint-disable-next-line react-internal/safe-string-coercion
		      var childrenString = String(children);
		      throw new Error("Objects are not valid as a React child (found: " + (childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString) + "). " + 'If you meant to render a collection of children, use an array ' + 'instead.');
		    }
		  }

		  return subtreeCount;
		}

		/**
		 * Maps children that are typically specified as `props.children`.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrenmap
		 *
		 * The provided mapFunction(child, index) will be called for each
		 * leaf child.
		 *
		 * @param {?*} children Children tree container.
		 * @param {function(*, int)} func The map function.
		 * @param {*} context Context for mapFunction.
		 * @return {object} Object containing the ordered map of results.
		 */
		function mapChildren(children, func, context) {
		  if (children == null) {
		    return children;
		  }

		  var result = [];
		  var count = 0;
		  mapIntoArray(children, result, '', '', function (child) {
		    return func.call(context, child, count++);
		  });
		  return result;
		}
		/**
		 * Count the number of children that are typically specified as
		 * `props.children`.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrencount
		 *
		 * @param {?*} children Children tree container.
		 * @return {number} The number of children.
		 */


		function countChildren(children) {
		  var n = 0;
		  mapChildren(children, function () {
		    n++; // Don't return anything
		  });
		  return n;
		}

		/**
		 * Iterates through children that are typically specified as `props.children`.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrenforeach
		 *
		 * The provided forEachFunc(child, index) will be called for each
		 * leaf child.
		 *
		 * @param {?*} children Children tree container.
		 * @param {function(*, int)} forEachFunc
		 * @param {*} forEachContext Context for forEachContext.
		 */
		function forEachChildren(children, forEachFunc, forEachContext) {
		  mapChildren(children, function () {
		    forEachFunc.apply(this, arguments); // Don't return anything.
		  }, forEachContext);
		}
		/**
		 * Flatten a children object (typically specified as `props.children`) and
		 * return an array with appropriately re-keyed children.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrentoarray
		 */


		function toArray(children) {
		  return mapChildren(children, function (child) {
		    return child;
		  }) || [];
		}
		/**
		 * Returns the first child in a collection of children and verifies that there
		 * is only one child in the collection.
		 *
		 * See https://reactjs.org/docs/react-api.html#reactchildrenonly
		 *
		 * The current implementation of this function assumes that a single child gets
		 * passed without a wrapper, but the purpose of this helper function is to
		 * abstract away the particular structure of children.
		 *
		 * @param {?object} children Child collection structure.
		 * @return {ReactElement} The first and only `ReactElement` contained in the
		 * structure.
		 */


		function onlyChild(children) {
		  if (!isValidElement(children)) {
		    throw new Error('React.Children.only expected to receive a single React element child.');
		  }

		  return children;
		}

		function createContext(defaultValue) {
		  // TODO: Second argument used to be an optional `calculateChangedBits`
		  // function. Warn to reserve for future use?
		  var context = {
		    $$typeof: REACT_CONTEXT_TYPE,
		    // As a workaround to support multiple concurrent renderers, we categorize
		    // some renderers as primary and others as secondary. We only expect
		    // there to be two concurrent renderers at most: React Native (primary) and
		    // Fabric (secondary); React DOM (primary) and React ART (secondary).
		    // Secondary renderers store their context values on separate fields.
		    _currentValue: defaultValue,
		    _currentValue2: defaultValue,
		    // Used to track how many concurrent renderers this context currently
		    // supports within in a single renderer. Such as parallel server rendering.
		    _threadCount: 0,
		    // These are circular
		    Provider: null,
		    Consumer: null,
		    // Add these to use same hidden class in VM as ServerContext
		    _defaultValue: null,
		    _globalName: null
		  };
		  context.Provider = {
		    $$typeof: REACT_PROVIDER_TYPE,
		    _context: context
		  };
		  var hasWarnedAboutUsingNestedContextConsumers = false;
		  var hasWarnedAboutUsingConsumerProvider = false;
		  var hasWarnedAboutDisplayNameOnConsumer = false;

		  {
		    // A separate object, but proxies back to the original context object for
		    // backwards compatibility. It has a different $$typeof, so we can properly
		    // warn for the incorrect usage of Context as a Consumer.
		    var Consumer = {
		      $$typeof: REACT_CONTEXT_TYPE,
		      _context: context
		    }; // $FlowFixMe: Flow complains about not setting a value, which is intentional here

		    Object.defineProperties(Consumer, {
		      Provider: {
		        get: function () {
		          if (!hasWarnedAboutUsingConsumerProvider) {
		            hasWarnedAboutUsingConsumerProvider = true;

		            error('Rendering <Context.Consumer.Provider> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Provider> instead?');
		          }

		          return context.Provider;
		        },
		        set: function (_Provider) {
		          context.Provider = _Provider;
		        }
		      },
		      _currentValue: {
		        get: function () {
		          return context._currentValue;
		        },
		        set: function (_currentValue) {
		          context._currentValue = _currentValue;
		        }
		      },
		      _currentValue2: {
		        get: function () {
		          return context._currentValue2;
		        },
		        set: function (_currentValue2) {
		          context._currentValue2 = _currentValue2;
		        }
		      },
		      _threadCount: {
		        get: function () {
		          return context._threadCount;
		        },
		        set: function (_threadCount) {
		          context._threadCount = _threadCount;
		        }
		      },
		      Consumer: {
		        get: function () {
		          if (!hasWarnedAboutUsingNestedContextConsumers) {
		            hasWarnedAboutUsingNestedContextConsumers = true;

		            error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ' + 'a future major release. Did you mean to render <Context.Consumer> instead?');
		          }

		          return context.Consumer;
		        }
		      },
		      displayName: {
		        get: function () {
		          return context.displayName;
		        },
		        set: function (displayName) {
		          if (!hasWarnedAboutDisplayNameOnConsumer) {
		            warn('Setting `displayName` on Context.Consumer has no effect. ' + "You should set it directly on the context with Context.displayName = '%s'.", displayName);

		            hasWarnedAboutDisplayNameOnConsumer = true;
		          }
		        }
		      }
		    }); // $FlowFixMe: Flow complains about missing properties because it doesn't understand defineProperty

		    context.Consumer = Consumer;
		  }

		  {
		    context._currentRenderer = null;
		    context._currentRenderer2 = null;
		  }

		  return context;
		}

		var Uninitialized = -1;
		var Pending = 0;
		var Resolved = 1;
		var Rejected = 2;

		function lazyInitializer(payload) {
		  if (payload._status === Uninitialized) {
		    var ctor = payload._result;
		    var thenable = ctor(); // Transition to the next state.
		    // This might throw either because it's missing or throws. If so, we treat it
		    // as still uninitialized and try again next time. Which is the same as what
		    // happens if the ctor or any wrappers processing the ctor throws. This might
		    // end up fixing it if the resolution was a concurrency bug.

		    thenable.then(function (moduleObject) {
		      if (payload._status === Pending || payload._status === Uninitialized) {
		        // Transition to the next state.
		        var resolved = payload;
		        resolved._status = Resolved;
		        resolved._result = moduleObject;
		      }
		    }, function (error) {
		      if (payload._status === Pending || payload._status === Uninitialized) {
		        // Transition to the next state.
		        var rejected = payload;
		        rejected._status = Rejected;
		        rejected._result = error;
		      }
		    });

		    if (payload._status === Uninitialized) {
		      // In case, we're still uninitialized, then we're waiting for the thenable
		      // to resolve. Set it as pending in the meantime.
		      var pending = payload;
		      pending._status = Pending;
		      pending._result = thenable;
		    }
		  }

		  if (payload._status === Resolved) {
		    var moduleObject = payload._result;

		    {
		      if (moduleObject === undefined) {
		        error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
		        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))\n\n" + 'Did you accidentally put curly braces around the import?', moduleObject);
		      }
		    }

		    {
		      if (!('default' in moduleObject)) {
		        error('lazy: Expected the result of a dynamic imp' + 'ort() call. ' + 'Instead received: %s\n\nYour code should look like: \n  ' + // Break up imports to avoid accidentally parsing them as dependencies.
		        'const MyComponent = lazy(() => imp' + "ort('./MyComponent'))", moduleObject);
		      }
		    }

		    return moduleObject.default;
		  } else {
		    throw payload._result;
		  }
		}

		function lazy(ctor) {
		  var payload = {
		    // We use these fields to store the result.
		    _status: Uninitialized,
		    _result: ctor
		  };
		  var lazyType = {
		    $$typeof: REACT_LAZY_TYPE,
		    _payload: payload,
		    _init: lazyInitializer
		  };

		  {
		    // In production, this would just set it on the object.
		    var defaultProps;
		    var propTypes; // $FlowFixMe

		    Object.defineProperties(lazyType, {
		      defaultProps: {
		        configurable: true,
		        get: function () {
		          return defaultProps;
		        },
		        set: function (newDefaultProps) {
		          error('React.lazy(...): It is not supported to assign `defaultProps` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

		          defaultProps = newDefaultProps; // Match production behavior more closely:
		          // $FlowFixMe

		          Object.defineProperty(lazyType, 'defaultProps', {
		            enumerable: true
		          });
		        }
		      },
		      propTypes: {
		        configurable: true,
		        get: function () {
		          return propTypes;
		        },
		        set: function (newPropTypes) {
		          error('React.lazy(...): It is not supported to assign `propTypes` to ' + 'a lazy component import. Either specify them where the component ' + 'is defined, or create a wrapping component around it.');

		          propTypes = newPropTypes; // Match production behavior more closely:
		          // $FlowFixMe

		          Object.defineProperty(lazyType, 'propTypes', {
		            enumerable: true
		          });
		        }
		      }
		    });
		  }

		  return lazyType;
		}

		function forwardRef(render) {
		  {
		    if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
		      error('forwardRef requires a render function but received a `memo` ' + 'component. Instead of forwardRef(memo(...)), use ' + 'memo(forwardRef(...)).');
		    } else if (typeof render !== 'function') {
		      error('forwardRef requires a render function but was given %s.', render === null ? 'null' : typeof render);
		    } else {
		      if (render.length !== 0 && render.length !== 2) {
		        error('forwardRef render functions accept exactly two parameters: props and ref. %s', render.length === 1 ? 'Did you forget to use the ref parameter?' : 'Any additional parameter will be undefined.');
		      }
		    }

		    if (render != null) {
		      if (render.defaultProps != null || render.propTypes != null) {
		        error('forwardRef render functions do not support propTypes or defaultProps. ' + 'Did you accidentally pass a React component?');
		      }
		    }
		  }

		  var elementType = {
		    $$typeof: REACT_FORWARD_REF_TYPE,
		    render: render
		  };

		  {
		    var ownName;
		    Object.defineProperty(elementType, 'displayName', {
		      enumerable: false,
		      configurable: true,
		      get: function () {
		        return ownName;
		      },
		      set: function (name) {
		        ownName = name; // The inner component shouldn't inherit this display name in most cases,
		        // because the component may be used elsewhere.
		        // But it's nice for anonymous functions to inherit the name,
		        // so that our component-stack generation logic will display their frames.
		        // An anonymous function generally suggests a pattern like:
		        //   React.forwardRef((props, ref) => {...});
		        // This kind of inner function is not used elsewhere so the side effect is okay.

		        if (!render.name && !render.displayName) {
		          render.displayName = name;
		        }
		      }
		    });
		  }

		  return elementType;
		}

		var REACT_MODULE_REFERENCE;

		{
		  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
		}

		function isValidElementType(type) {
		  if (typeof type === 'string' || typeof type === 'function') {
		    return true;
		  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


		  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
		    return true;
		  }

		  if (typeof type === 'object' && type !== null) {
		    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
		    // types supported by any Flight configuration anywhere since
		    // we don't know which Flight build this will end up being used
		    // with.
		    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
		      return true;
		    }
		  }

		  return false;
		}

		function memo(type, compare) {
		  {
		    if (!isValidElementType(type)) {
		      error('memo: The first argument must be a component. Instead ' + 'received: %s', type === null ? 'null' : typeof type);
		    }
		  }

		  var elementType = {
		    $$typeof: REACT_MEMO_TYPE,
		    type: type,
		    compare: compare === undefined ? null : compare
		  };

		  {
		    var ownName;
		    Object.defineProperty(elementType, 'displayName', {
		      enumerable: false,
		      configurable: true,
		      get: function () {
		        return ownName;
		      },
		      set: function (name) {
		        ownName = name; // The inner component shouldn't inherit this display name in most cases,
		        // because the component may be used elsewhere.
		        // But it's nice for anonymous functions to inherit the name,
		        // so that our component-stack generation logic will display their frames.
		        // An anonymous function generally suggests a pattern like:
		        //   React.memo((props) => {...});
		        // This kind of inner function is not used elsewhere so the side effect is okay.

		        if (!type.name && !type.displayName) {
		          type.displayName = name;
		        }
		      }
		    });
		  }

		  return elementType;
		}

		function resolveDispatcher() {
		  var dispatcher = ReactCurrentDispatcher.current;

		  {
		    if (dispatcher === null) {
		      error('Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' + ' one of the following reasons:\n' + '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' + '2. You might be breaking the Rules of Hooks\n' + '3. You might have more than one copy of React in the same app\n' + 'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.');
		    }
		  } // Will result in a null access error if accessed outside render phase. We
		  // intentionally don't throw our own error because this is in a hot path.
		  // Also helps ensure this is inlined.


		  return dispatcher;
		}
		function useContext(Context) {
		  var dispatcher = resolveDispatcher();

		  {
		    // TODO: add a more generic warning for invalid values.
		    if (Context._context !== undefined) {
		      var realContext = Context._context; // Don't deduplicate because this legitimately causes bugs
		      // and nobody should be using this in existing code.

		      if (realContext.Consumer === Context) {
		        error('Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be ' + 'removed in a future major release. Did you mean to call useContext(Context) instead?');
		      } else if (realContext.Provider === Context) {
		        error('Calling useContext(Context.Provider) is not supported. ' + 'Did you mean to call useContext(Context) instead?');
		      }
		    }
		  }

		  return dispatcher.useContext(Context);
		}
		function useState(initialState) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useState(initialState);
		}
		function useReducer(reducer, initialArg, init) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useReducer(reducer, initialArg, init);
		}
		function useRef(initialValue) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useRef(initialValue);
		}
		function useEffect(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useEffect(create, deps);
		}
		function useInsertionEffect(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useInsertionEffect(create, deps);
		}
		function useLayoutEffect(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useLayoutEffect(create, deps);
		}
		function useCallback(callback, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useCallback(callback, deps);
		}
		function useMemo(create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useMemo(create, deps);
		}
		function useImperativeHandle(ref, create, deps) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useImperativeHandle(ref, create, deps);
		}
		function useDebugValue(value, formatterFn) {
		  {
		    var dispatcher = resolveDispatcher();
		    return dispatcher.useDebugValue(value, formatterFn);
		  }
		}
		function useTransition() {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useTransition();
		}
		function useDeferredValue(value) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useDeferredValue(value);
		}
		function useId() {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useId();
		}
		function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		  var dispatcher = resolveDispatcher();
		  return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
		}

		// Helpers to patch console.logs to avoid logging during side-effect free
		// replaying on render function. This currently only patches the object
		// lazily which won't cover if the log function was extracted eagerly.
		// We could also eagerly patch the method.
		var disabledDepth = 0;
		var prevLog;
		var prevInfo;
		var prevWarn;
		var prevError;
		var prevGroup;
		var prevGroupCollapsed;
		var prevGroupEnd;

		function disabledLog() {}

		disabledLog.__reactDisabledLog = true;
		function disableLogs() {
		  {
		    if (disabledDepth === 0) {
		      /* eslint-disable react-internal/no-production-logging */
		      prevLog = console.log;
		      prevInfo = console.info;
		      prevWarn = console.warn;
		      prevError = console.error;
		      prevGroup = console.group;
		      prevGroupCollapsed = console.groupCollapsed;
		      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

		      var props = {
		        configurable: true,
		        enumerable: true,
		        value: disabledLog,
		        writable: true
		      }; // $FlowFixMe Flow thinks console is immutable.

		      Object.defineProperties(console, {
		        info: props,
		        log: props,
		        warn: props,
		        error: props,
		        group: props,
		        groupCollapsed: props,
		        groupEnd: props
		      });
		      /* eslint-enable react-internal/no-production-logging */
		    }

		    disabledDepth++;
		  }
		}
		function reenableLogs() {
		  {
		    disabledDepth--;

		    if (disabledDepth === 0) {
		      /* eslint-disable react-internal/no-production-logging */
		      var props = {
		        configurable: true,
		        enumerable: true,
		        writable: true
		      }; // $FlowFixMe Flow thinks console is immutable.

		      Object.defineProperties(console, {
		        log: assign({}, props, {
		          value: prevLog
		        }),
		        info: assign({}, props, {
		          value: prevInfo
		        }),
		        warn: assign({}, props, {
		          value: prevWarn
		        }),
		        error: assign({}, props, {
		          value: prevError
		        }),
		        group: assign({}, props, {
		          value: prevGroup
		        }),
		        groupCollapsed: assign({}, props, {
		          value: prevGroupCollapsed
		        }),
		        groupEnd: assign({}, props, {
		          value: prevGroupEnd
		        })
		      });
		      /* eslint-enable react-internal/no-production-logging */
		    }

		    if (disabledDepth < 0) {
		      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
		    }
		  }
		}

		var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
		var prefix;
		function describeBuiltInComponentFrame(name, source, ownerFn) {
		  {
		    if (prefix === undefined) {
		      // Extract the VM specific prefix used by each line.
		      try {
		        throw Error();
		      } catch (x) {
		        var match = x.stack.trim().match(/\n( *(at )?)/);
		        prefix = match && match[1] || '';
		      }
		    } // We use the prefix to ensure our stacks line up with native stack frames.


		    return '\n' + prefix + name;
		  }
		}
		var reentry = false;
		var componentFrameCache;

		{
		  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
		  componentFrameCache = new PossiblyWeakMap();
		}

		function describeNativeComponentFrame(fn, construct) {
		  // If something asked for a stack inside a fake render, it should get ignored.
		  if ( !fn || reentry) {
		    return '';
		  }

		  {
		    var frame = componentFrameCache.get(fn);

		    if (frame !== undefined) {
		      return frame;
		    }
		  }

		  var control;
		  reentry = true;
		  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

		  Error.prepareStackTrace = undefined;
		  var previousDispatcher;

		  {
		    previousDispatcher = ReactCurrentDispatcher$1.current; // Set the dispatcher in DEV because this might be call in the render function
		    // for warnings.

		    ReactCurrentDispatcher$1.current = null;
		    disableLogs();
		  }

		  try {
		    // This should throw.
		    if (construct) {
		      // Something should be setting the props in the constructor.
		      var Fake = function () {
		        throw Error();
		      }; // $FlowFixMe


		      Object.defineProperty(Fake.prototype, 'props', {
		        set: function () {
		          // We use a throwing setter instead of frozen or non-writable props
		          // because that won't throw in a non-strict mode function.
		          throw Error();
		        }
		      });

		      if (typeof Reflect === 'object' && Reflect.construct) {
		        // We construct a different control for this case to include any extra
		        // frames added by the construct call.
		        try {
		          Reflect.construct(Fake, []);
		        } catch (x) {
		          control = x;
		        }

		        Reflect.construct(fn, [], Fake);
		      } else {
		        try {
		          Fake.call();
		        } catch (x) {
		          control = x;
		        }

		        fn.call(Fake.prototype);
		      }
		    } else {
		      try {
		        throw Error();
		      } catch (x) {
		        control = x;
		      }

		      fn();
		    }
		  } catch (sample) {
		    // This is inlined manually because closure doesn't do it for us.
		    if (sample && control && typeof sample.stack === 'string') {
		      // This extracts the first frame from the sample that isn't also in the control.
		      // Skipping one frame that we assume is the frame that calls the two.
		      var sampleLines = sample.stack.split('\n');
		      var controlLines = control.stack.split('\n');
		      var s = sampleLines.length - 1;
		      var c = controlLines.length - 1;

		      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
		        // We expect at least one stack frame to be shared.
		        // Typically this will be the root most one. However, stack frames may be
		        // cut off due to maximum stack limits. In this case, one maybe cut off
		        // earlier than the other. We assume that the sample is longer or the same
		        // and there for cut off earlier. So we should find the root most frame in
		        // the sample somewhere in the control.
		        c--;
		      }

		      for (; s >= 1 && c >= 0; s--, c--) {
		        // Next we find the first one that isn't the same which should be the
		        // frame that called our sample function and the control.
		        if (sampleLines[s] !== controlLines[c]) {
		          // In V8, the first line is describing the message but other VMs don't.
		          // If we're about to return the first line, and the control is also on the same
		          // line, that's a pretty good indicator that our sample threw at same line as
		          // the control. I.e. before we entered the sample frame. So we ignore this result.
		          // This can happen if you passed a class to function component, or non-function.
		          if (s !== 1 || c !== 1) {
		            do {
		              s--;
		              c--; // We may still have similar intermediate frames from the construct call.
		              // The next one that isn't the same should be our match though.

		              if (c < 0 || sampleLines[s] !== controlLines[c]) {
		                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
		                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
		                // but we have a user-provided "displayName"
		                // splice it in to make the stack more readable.


		                if (fn.displayName && _frame.includes('<anonymous>')) {
		                  _frame = _frame.replace('<anonymous>', fn.displayName);
		                }

		                {
		                  if (typeof fn === 'function') {
		                    componentFrameCache.set(fn, _frame);
		                  }
		                } // Return the line we found.


		                return _frame;
		              }
		            } while (s >= 1 && c >= 0);
		          }

		          break;
		        }
		      }
		    }
		  } finally {
		    reentry = false;

		    {
		      ReactCurrentDispatcher$1.current = previousDispatcher;
		      reenableLogs();
		    }

		    Error.prepareStackTrace = previousPrepareStackTrace;
		  } // Fallback to just using the name if we couldn't make it throw.


		  var name = fn ? fn.displayName || fn.name : '';
		  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

		  {
		    if (typeof fn === 'function') {
		      componentFrameCache.set(fn, syntheticFrame);
		    }
		  }

		  return syntheticFrame;
		}
		function describeFunctionComponentFrame(fn, source, ownerFn) {
		  {
		    return describeNativeComponentFrame(fn, false);
		  }
		}

		function shouldConstruct(Component) {
		  var prototype = Component.prototype;
		  return !!(prototype && prototype.isReactComponent);
		}

		function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

		  if (type == null) {
		    return '';
		  }

		  if (typeof type === 'function') {
		    {
		      return describeNativeComponentFrame(type, shouldConstruct(type));
		    }
		  }

		  if (typeof type === 'string') {
		    return describeBuiltInComponentFrame(type);
		  }

		  switch (type) {
		    case REACT_SUSPENSE_TYPE:
		      return describeBuiltInComponentFrame('Suspense');

		    case REACT_SUSPENSE_LIST_TYPE:
		      return describeBuiltInComponentFrame('SuspenseList');
		  }

		  if (typeof type === 'object') {
		    switch (type.$$typeof) {
		      case REACT_FORWARD_REF_TYPE:
		        return describeFunctionComponentFrame(type.render);

		      case REACT_MEMO_TYPE:
		        // Memo may contain any component type so we recursively resolve it.
		        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

		      case REACT_LAZY_TYPE:
		        {
		          var lazyComponent = type;
		          var payload = lazyComponent._payload;
		          var init = lazyComponent._init;

		          try {
		            // Lazy may contain any component type so we recursively resolve it.
		            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
		          } catch (x) {}
		        }
		    }
		  }

		  return '';
		}

		var loggedTypeFailures = {};
		var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

		function setCurrentlyValidatingElement(element) {
		  {
		    if (element) {
		      var owner = element._owner;
		      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
		      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
		    } else {
		      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
		    }
		  }
		}

		function checkPropTypes(typeSpecs, values, location, componentName, element) {
		  {
		    // $FlowFixMe This is okay but Flow doesn't know it.
		    var has = Function.call.bind(hasOwnProperty);

		    for (var typeSpecName in typeSpecs) {
		      if (has(typeSpecs, typeSpecName)) {
		        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
		        // fail the render phase where it didn't fail before. So we log it.
		        // After these have been cleaned up, we'll let them throw.

		        try {
		          // This is intentionally an invariant that gets caught. It's the same
		          // behavior as without this statement except with a better message.
		          if (typeof typeSpecs[typeSpecName] !== 'function') {
		            // eslint-disable-next-line react-internal/prod-error-codes
		            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
		            err.name = 'Invariant Violation';
		            throw err;
		          }

		          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
		        } catch (ex) {
		          error$1 = ex;
		        }

		        if (error$1 && !(error$1 instanceof Error)) {
		          setCurrentlyValidatingElement(element);

		          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

		          setCurrentlyValidatingElement(null);
		        }

		        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
		          // Only monitor this failure once because there tends to be a lot of the
		          // same error.
		          loggedTypeFailures[error$1.message] = true;
		          setCurrentlyValidatingElement(element);

		          error('Failed %s type: %s', location, error$1.message);

		          setCurrentlyValidatingElement(null);
		        }
		      }
		    }
		  }
		}

		function setCurrentlyValidatingElement$1(element) {
		  {
		    if (element) {
		      var owner = element._owner;
		      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
		      setExtraStackFrame(stack);
		    } else {
		      setExtraStackFrame(null);
		    }
		  }
		}

		var propTypesMisspellWarningShown;

		{
		  propTypesMisspellWarningShown = false;
		}

		function getDeclarationErrorAddendum() {
		  if (ReactCurrentOwner.current) {
		    var name = getComponentNameFromType(ReactCurrentOwner.current.type);

		    if (name) {
		      return '\n\nCheck the render method of `' + name + '`.';
		    }
		  }

		  return '';
		}

		function getSourceInfoErrorAddendum(source) {
		  if (source !== undefined) {
		    var fileName = source.fileName.replace(/^.*[\\\/]/, '');
		    var lineNumber = source.lineNumber;
		    return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
		  }

		  return '';
		}

		function getSourceInfoErrorAddendumForProps(elementProps) {
		  if (elementProps !== null && elementProps !== undefined) {
		    return getSourceInfoErrorAddendum(elementProps.__source);
		  }

		  return '';
		}
		/**
		 * Warn if there's no key explicitly set on dynamic arrays of children or
		 * object keys are not valid. This allows us to keep track of children between
		 * updates.
		 */


		var ownerHasKeyUseWarning = {};

		function getCurrentComponentErrorInfo(parentType) {
		  var info = getDeclarationErrorAddendum();

		  if (!info) {
		    var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

		    if (parentName) {
		      info = "\n\nCheck the top-level render call using <" + parentName + ">.";
		    }
		  }

		  return info;
		}
		/**
		 * Warn if the element doesn't have an explicit key assigned to it.
		 * This element is in an array. The array could grow and shrink or be
		 * reordered. All children that haven't already been validated are required to
		 * have a "key" property assigned to it. Error statuses are cached so a warning
		 * will only be shown once.
		 *
		 * @internal
		 * @param {ReactElement} element Element that requires a key.
		 * @param {*} parentType element's parent's type.
		 */


		function validateExplicitKey(element, parentType) {
		  if (!element._store || element._store.validated || element.key != null) {
		    return;
		  }

		  element._store.validated = true;
		  var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

		  if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
		    return;
		  }

		  ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
		  // property, it may be the creator of the child that's responsible for
		  // assigning it a key.

		  var childOwner = '';

		  if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
		    // Give the component that originally created this child.
		    childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
		  }

		  {
		    setCurrentlyValidatingElement$1(element);

		    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

		    setCurrentlyValidatingElement$1(null);
		  }
		}
		/**
		 * Ensure that every element either is passed in a static location, in an
		 * array with an explicit keys property defined, or in an object literal
		 * with valid key property.
		 *
		 * @internal
		 * @param {ReactNode} node Statically passed child of any type.
		 * @param {*} parentType node's parent's type.
		 */


		function validateChildKeys(node, parentType) {
		  if (typeof node !== 'object') {
		    return;
		  }

		  if (isArray(node)) {
		    for (var i = 0; i < node.length; i++) {
		      var child = node[i];

		      if (isValidElement(child)) {
		        validateExplicitKey(child, parentType);
		      }
		    }
		  } else if (isValidElement(node)) {
		    // This element was passed in a valid location.
		    if (node._store) {
		      node._store.validated = true;
		    }
		  } else if (node) {
		    var iteratorFn = getIteratorFn(node);

		    if (typeof iteratorFn === 'function') {
		      // Entry iterators used to provide implicit keys,
		      // but now we print a separate warning for them later.
		      if (iteratorFn !== node.entries) {
		        var iterator = iteratorFn.call(node);
		        var step;

		        while (!(step = iterator.next()).done) {
		          if (isValidElement(step.value)) {
		            validateExplicitKey(step.value, parentType);
		          }
		        }
		      }
		    }
		  }
		}
		/**
		 * Given an element, validate that its props follow the propTypes definition,
		 * provided by the type.
		 *
		 * @param {ReactElement} element
		 */


		function validatePropTypes(element) {
		  {
		    var type = element.type;

		    if (type === null || type === undefined || typeof type === 'string') {
		      return;
		    }

		    var propTypes;

		    if (typeof type === 'function') {
		      propTypes = type.propTypes;
		    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
		    // Inner props are checked in the reconciler.
		    type.$$typeof === REACT_MEMO_TYPE)) {
		      propTypes = type.propTypes;
		    } else {
		      return;
		    }

		    if (propTypes) {
		      // Intentionally inside to avoid triggering lazy initializers:
		      var name = getComponentNameFromType(type);
		      checkPropTypes(propTypes, element.props, 'prop', name, element);
		    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
		      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

		      var _name = getComponentNameFromType(type);

		      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
		    }

		    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
		      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
		    }
		  }
		}
		/**
		 * Given a fragment, validate that it can only be provided with fragment props
		 * @param {ReactElement} fragment
		 */


		function validateFragmentProps(fragment) {
		  {
		    var keys = Object.keys(fragment.props);

		    for (var i = 0; i < keys.length; i++) {
		      var key = keys[i];

		      if (key !== 'children' && key !== 'key') {
		        setCurrentlyValidatingElement$1(fragment);

		        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

		        setCurrentlyValidatingElement$1(null);
		        break;
		      }
		    }

		    if (fragment.ref !== null) {
		      setCurrentlyValidatingElement$1(fragment);

		      error('Invalid attribute `ref` supplied to `React.Fragment`.');

		      setCurrentlyValidatingElement$1(null);
		    }
		  }
		}
		function createElementWithValidation(type, props, children) {
		  var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
		  // succeed and there will likely be errors in render.

		  if (!validType) {
		    var info = '';

		    if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
		      info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
		    }

		    var sourceInfo = getSourceInfoErrorAddendumForProps(props);

		    if (sourceInfo) {
		      info += sourceInfo;
		    } else {
		      info += getDeclarationErrorAddendum();
		    }

		    var typeString;

		    if (type === null) {
		      typeString = 'null';
		    } else if (isArray(type)) {
		      typeString = 'array';
		    } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
		      typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
		      info = ' Did you accidentally export a JSX literal instead of a component?';
		    } else {
		      typeString = typeof type;
		    }

		    {
		      error('React.createElement: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
		    }
		  }

		  var element = createElement.apply(this, arguments); // The result can be nullish if a mock or a custom function is used.
		  // TODO: Drop this when these are no longer allowed as the type argument.

		  if (element == null) {
		    return element;
		  } // Skip key warning if the type isn't valid since our key validation logic
		  // doesn't expect a non-string/function type and can throw confusing errors.
		  // We don't want exception behavior to differ between dev and prod.
		  // (Rendering will throw with a helpful message and as soon as the type is
		  // fixed, the key warnings will appear.)


		  if (validType) {
		    for (var i = 2; i < arguments.length; i++) {
		      validateChildKeys(arguments[i], type);
		    }
		  }

		  if (type === REACT_FRAGMENT_TYPE) {
		    validateFragmentProps(element);
		  } else {
		    validatePropTypes(element);
		  }

		  return element;
		}
		var didWarnAboutDeprecatedCreateFactory = false;
		function createFactoryWithValidation(type) {
		  var validatedFactory = createElementWithValidation.bind(null, type);
		  validatedFactory.type = type;

		  {
		    if (!didWarnAboutDeprecatedCreateFactory) {
		      didWarnAboutDeprecatedCreateFactory = true;

		      warn('React.createFactory() is deprecated and will be removed in ' + 'a future major release. Consider using JSX ' + 'or use React.createElement() directly instead.');
		    } // Legacy hook: remove it


		    Object.defineProperty(validatedFactory, 'type', {
		      enumerable: false,
		      get: function () {
		        warn('Factory.type is deprecated. Access the class directly ' + 'before passing it to createFactory.');

		        Object.defineProperty(this, 'type', {
		          value: type
		        });
		        return type;
		      }
		    });
		  }

		  return validatedFactory;
		}
		function cloneElementWithValidation(element, props, children) {
		  var newElement = cloneElement.apply(this, arguments);

		  for (var i = 2; i < arguments.length; i++) {
		    validateChildKeys(arguments[i], newElement.type);
		  }

		  validatePropTypes(newElement);
		  return newElement;
		}

		function startTransition(scope, options) {
		  var prevTransition = ReactCurrentBatchConfig.transition;
		  ReactCurrentBatchConfig.transition = {};
		  var currentTransition = ReactCurrentBatchConfig.transition;

		  {
		    ReactCurrentBatchConfig.transition._updatedFibers = new Set();
		  }

		  try {
		    scope();
		  } finally {
		    ReactCurrentBatchConfig.transition = prevTransition;

		    {
		      if (prevTransition === null && currentTransition._updatedFibers) {
		        var updatedFibersCount = currentTransition._updatedFibers.size;

		        if (updatedFibersCount > 10) {
		          warn('Detected a large number of updates inside startTransition. ' + 'If this is due to a subscription please re-write it to use React provided hooks. ' + 'Otherwise concurrent mode guarantees are off the table.');
		        }

		        currentTransition._updatedFibers.clear();
		      }
		    }
		  }
		}

		var didWarnAboutMessageChannel = false;
		var enqueueTaskImpl = null;
		function enqueueTask(task) {
		  if (enqueueTaskImpl === null) {
		    try {
		      // read require off the module object to get around the bundlers.
		      // we don't want them to detect a require and bundle a Node polyfill.
		      var requireString = ('require' + Math.random()).slice(0, 7);
		      var nodeRequire = module && module[requireString]; // assuming we're in node, let's try to get node's
		      // version of setImmediate, bypassing fake timers if any.

		      enqueueTaskImpl = nodeRequire.call(module, 'timers').setImmediate;
		    } catch (_err) {
		      // we're in a browser
		      // we can't use regular timers because they may still be faked
		      // so we try MessageChannel+postMessage instead
		      enqueueTaskImpl = function (callback) {
		        {
		          if (didWarnAboutMessageChannel === false) {
		            didWarnAboutMessageChannel = true;

		            if (typeof MessageChannel === 'undefined') {
		              error('This browser does not have a MessageChannel implementation, ' + 'so enqueuing tasks via await act(async () => ...) will fail. ' + 'Please file an issue at https://github.com/facebook/react/issues ' + 'if you encounter this warning.');
		            }
		          }
		        }

		        var channel = new MessageChannel();
		        channel.port1.onmessage = callback;
		        channel.port2.postMessage(undefined);
		      };
		    }
		  }

		  return enqueueTaskImpl(task);
		}

		var actScopeDepth = 0;
		var didWarnNoAwaitAct = false;
		function act(callback) {
		  {
		    // `act` calls can be nested, so we track the depth. This represents the
		    // number of `act` scopes on the stack.
		    var prevActScopeDepth = actScopeDepth;
		    actScopeDepth++;

		    if (ReactCurrentActQueue.current === null) {
		      // This is the outermost `act` scope. Initialize the queue. The reconciler
		      // will detect the queue and use it instead of Scheduler.
		      ReactCurrentActQueue.current = [];
		    }

		    var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
		    var result;

		    try {
		      // Used to reproduce behavior of `batchedUpdates` in legacy mode. Only
		      // set to `true` while the given callback is executed, not for updates
		      // triggered during an async event, because this is how the legacy
		      // implementation of `act` behaved.
		      ReactCurrentActQueue.isBatchingLegacy = true;
		      result = callback(); // Replicate behavior of original `act` implementation in legacy mode,
		      // which flushed updates immediately after the scope function exits, even
		      // if it's an async function.

		      if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
		        var queue = ReactCurrentActQueue.current;

		        if (queue !== null) {
		          ReactCurrentActQueue.didScheduleLegacyUpdate = false;
		          flushActQueue(queue);
		        }
		      }
		    } catch (error) {
		      popActScope(prevActScopeDepth);
		      throw error;
		    } finally {
		      ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
		    }

		    if (result !== null && typeof result === 'object' && typeof result.then === 'function') {
		      var thenableResult = result; // The callback is an async function (i.e. returned a promise). Wait
		      // for it to resolve before exiting the current scope.

		      var wasAwaited = false;
		      var thenable = {
		        then: function (resolve, reject) {
		          wasAwaited = true;
		          thenableResult.then(function (returnValue) {
		            popActScope(prevActScopeDepth);

		            if (actScopeDepth === 0) {
		              // We've exited the outermost act scope. Recursively flush the
		              // queue until there's no remaining work.
		              recursivelyFlushAsyncActWork(returnValue, resolve, reject);
		            } else {
		              resolve(returnValue);
		            }
		          }, function (error) {
		            // The callback threw an error.
		            popActScope(prevActScopeDepth);
		            reject(error);
		          });
		        }
		      };

		      {
		        if (!didWarnNoAwaitAct && typeof Promise !== 'undefined') {
		          // eslint-disable-next-line no-undef
		          Promise.resolve().then(function () {}).then(function () {
		            if (!wasAwaited) {
		              didWarnNoAwaitAct = true;

		              error('You called act(async () => ...) without await. ' + 'This could lead to unexpected testing behaviour, ' + 'interleaving multiple act calls and mixing their ' + 'scopes. ' + 'You should - await act(async () => ...);');
		            }
		          });
		        }
		      }

		      return thenable;
		    } else {
		      var returnValue = result; // The callback is not an async function. Exit the current scope
		      // immediately, without awaiting.

		      popActScope(prevActScopeDepth);

		      if (actScopeDepth === 0) {
		        // Exiting the outermost act scope. Flush the queue.
		        var _queue = ReactCurrentActQueue.current;

		        if (_queue !== null) {
		          flushActQueue(_queue);
		          ReactCurrentActQueue.current = null;
		        } // Return a thenable. If the user awaits it, we'll flush again in
		        // case additional work was scheduled by a microtask.


		        var _thenable = {
		          then: function (resolve, reject) {
		            // Confirm we haven't re-entered another `act` scope, in case
		            // the user does something weird like await the thenable
		            // multiple times.
		            if (ReactCurrentActQueue.current === null) {
		              // Recursively flush the queue until there's no remaining work.
		              ReactCurrentActQueue.current = [];
		              recursivelyFlushAsyncActWork(returnValue, resolve, reject);
		            } else {
		              resolve(returnValue);
		            }
		          }
		        };
		        return _thenable;
		      } else {
		        // Since we're inside a nested `act` scope, the returned thenable
		        // immediately resolves. The outer scope will flush the queue.
		        var _thenable2 = {
		          then: function (resolve, reject) {
		            resolve(returnValue);
		          }
		        };
		        return _thenable2;
		      }
		    }
		  }
		}

		function popActScope(prevActScopeDepth) {
		  {
		    if (prevActScopeDepth !== actScopeDepth - 1) {
		      error('You seem to have overlapping act() calls, this is not supported. ' + 'Be sure to await previous act() calls before making a new one. ');
		    }

		    actScopeDepth = prevActScopeDepth;
		  }
		}

		function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
		  {
		    var queue = ReactCurrentActQueue.current;

		    if (queue !== null) {
		      try {
		        flushActQueue(queue);
		        enqueueTask(function () {
		          if (queue.length === 0) {
		            // No additional work was scheduled. Finish.
		            ReactCurrentActQueue.current = null;
		            resolve(returnValue);
		          } else {
		            // Keep flushing work until there's none left.
		            recursivelyFlushAsyncActWork(returnValue, resolve, reject);
		          }
		        });
		      } catch (error) {
		        reject(error);
		      }
		    } else {
		      resolve(returnValue);
		    }
		  }
		}

		var isFlushing = false;

		function flushActQueue(queue) {
		  {
		    if (!isFlushing) {
		      // Prevent re-entrance.
		      isFlushing = true;
		      var i = 0;

		      try {
		        for (; i < queue.length; i++) {
		          var callback = queue[i];

		          do {
		            callback = callback(true);
		          } while (callback !== null);
		        }

		        queue.length = 0;
		      } catch (error) {
		        // If something throws, leave the remaining callbacks on the queue.
		        queue = queue.slice(i + 1);
		        throw error;
		      } finally {
		        isFlushing = false;
		      }
		    }
		  }
		}

		var createElement$1 =  createElementWithValidation ;
		var cloneElement$1 =  cloneElementWithValidation ;
		var createFactory =  createFactoryWithValidation ;
		var Children = {
		  map: mapChildren,
		  forEach: forEachChildren,
		  count: countChildren,
		  toArray: toArray,
		  only: onlyChild
		};

		exports.Children = Children;
		exports.Component = Component;
		exports.Fragment = REACT_FRAGMENT_TYPE;
		exports.Profiler = REACT_PROFILER_TYPE;
		exports.PureComponent = PureComponent;
		exports.StrictMode = REACT_STRICT_MODE_TYPE;
		exports.Suspense = REACT_SUSPENSE_TYPE;
		exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
		exports.cloneElement = cloneElement$1;
		exports.createContext = createContext;
		exports.createElement = createElement$1;
		exports.createFactory = createFactory;
		exports.createRef = createRef;
		exports.forwardRef = forwardRef;
		exports.isValidElement = isValidElement;
		exports.lazy = lazy;
		exports.memo = memo;
		exports.startTransition = startTransition;
		exports.unstable_act = act;
		exports.useCallback = useCallback;
		exports.useContext = useContext;
		exports.useDebugValue = useDebugValue;
		exports.useDeferredValue = useDeferredValue;
		exports.useEffect = useEffect;
		exports.useId = useId;
		exports.useImperativeHandle = useImperativeHandle;
		exports.useInsertionEffect = useInsertionEffect;
		exports.useLayoutEffect = useLayoutEffect;
		exports.useMemo = useMemo;
		exports.useReducer = useReducer;
		exports.useRef = useRef;
		exports.useState = useState;
		exports.useSyncExternalStore = useSyncExternalStore;
		exports.useTransition = useTransition;
		exports.version = ReactVersion;
		          /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
		if (
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' &&
		  typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop ===
		    'function'
		) {
		  __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
		}
		        
		  })();
		} 
	} (react_development, react_development.exports));
	return react_development.exports;
}

if (process.env.NODE_ENV === 'production') {
  react.exports = requireReact_production_min();
} else {
  react.exports = requireReact_development();
}

var reactExports = react.exports;
var React = /*@__PURE__*/getDefaultExportFromCjs(reactExports);

var Button = function (props) {
    var children = props.children, _a = props.size, size = _a === void 0 ? 'md' : _a, _b = props.color, color = _b === void 0 ? 'primary' : _b, _c = props.disabled, disabled = _c === void 0 ? false : _c, _d = props.fullWidth, fullWidth = _d === void 0 ? false : _d, _e = props.className, className = _e === void 0 ? "" : _e, rest = __rest(props, ["children", "size", "color", "disabled", "fullWidth", "className"]);
    return (React.createElement("button", __assign({ type: "button", className: clsxm('text-slate-200', 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2', 'rounded cursor-pointer', size === 'sm' && 'px-2 py-1 text-sm', size === 'md' && 'px-2.5 py-1.5 text-base', size === 'lg' && 'px-4 py-3 text-base', color === 'primary' && "bg-primary-600 hover:bg-primary-500 focus-visible:outline-primary-600", color === 'secondary' && "bg-secondary-600 hover:bg-secondary-500 focus-visible:outline-secondary-600", color === 'warning' && "bg-warning-600 hover:bg-warning-500 focus-visible:outline-warning-600", color === 'danger' && "bg-danger-600 hover:bg-danger-500 focus-visible:outline-danger-600", color === 'success' && "bg-success-600 hover:bg-success-500 focus-visible:outline-success-600", fullWidth && 'w-full', disabled && 'bg-disabled-400 hover:bg-disabled-400 cursor-default', className) }, rest), children));
};

var specks = function (color) {
    if (color === void 0) { color = "#000"; }
    return (btoa("\n    <svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'>\n        <filter id='noiseFilter'>\n            <feTurbulence\n            type='fractalNoise'\n            baseFrequency='2.31'\n            numOctaves='6'\n            stitchTiles='stitch'/>\n        </filter>\n        <rect width='100%' height='100%' fill=\"".concat(color, "\" filter='url(#noiseFilter)'/>\n    </svg>\n")));
};
var NoiseBackground = function (_a) {
    var _b = _a.shade, shade = _b === void 0 ? 'medium' : _b;
    return (React.createElement("div", { className: clsxm('h-full w-full absolute top-0 left-0', shade === 'light' && 'bg-white dark:bg-bg-900', shade === 'medium' && 'bg-bg-200 dark:bg-bg-950', shade === 'dark' && 'bg-bg-300 dark:bg-black') },
        React.createElement("div", { className: clsxm("h-full w-full absolute top-0 left-0 opacity-40 dark:opacity-10"), style: { background: "url(data:image/svg+xml;base64,".concat(specks(), ")") } })));
};

var Card = function (_a) {
    var _b = _a.shade, shade = _b === void 0 ? 'medium' : _b, children = _a.children, _c = _a.className, className = _c === void 0 ? '' : _c, props = __rest(_a, ["shade", "children", "className"]);
    return (React.createElement("div", __assign({ className: clsxm('card relative overflow-hidden p-6 backdrop-blur-2xs shadow-xl border rounded', 'shadow-bg-950/4 dark:shadow-bg-950/20 border-bg-950 dark:border-bg-50', shade === 'light' && 'border-opacity-4 dark:border-opacity-8', shade === 'medium' && 'border-opacity-6 dark:border-opacity-6', shade === 'dark' && 'border-opacity-10 dark:border-opacity-4', className) }, props),
        React.createElement(NoiseBackground, { shade: shade }),
        React.createElement("div", { className: "relative" }, children)));
};

var Logo = function (_a) {
    var _b = _a.size, size = _b === void 0 ? 'md' : _b, mode = _a.mode, _c = _a.className, className = _c === void 0 ? '' : _c;
    return (React.createElement("svg", { className: clsxm('inline-block', size === 'xs' && 'h-5 w-5', size === 'sm' && 'h-10 w-10', size === 'md' && 'h-20 w-20', size === 'lg' && 'h-40 w-40', size === 'xl' && 'h-80 w-80', className), fill: "none", viewBox: "0 0 100 100", xmlns: "http://www.w3.org/2000/svg" },
        React.createElement("path", { className: clsxm("dark:fill-bg-200 fill-bg-800", mode === 'light' && "dark:fill-bg-200 fill-bg-200", mode === 'dark' && "dark:fill-bg-800 fill-bg-800"), d: "M80.8848 47.0283L52.6849 18.8284C51.1228 17.2663 48.5901 17.2663 47.028 18.8284L18.8281 47.0283C17.266 48.5904 17.266 51.1231 18.8281 52.6852L47.028 80.8851C48.5901 82.4472 51.1228 82.4472 52.6849 80.8851L80.8848 52.6852C82.4469 51.1231 82.4469 48.5904 80.8848 47.0283Z" })));
};

var Error$1 = function (_a) {
    var children = _a.children, _b = _a.className, className = _b === void 0 ? '' : _b, props = __rest(_a, ["children", "className"]);
    return (React.createElement("div", __assign({ className: clsxm("text-red-700 font-bold text-xs block mt-2 w-full", children ? "visible" : "invisible", className) }, props), children));
};

var Input = function (props) {
    var _a = props.type, type = _a === void 0 ? 'text' : _a, registration = props.registration, _b = props.className, className = _b === void 0 ? '' : _b;
    return (React.createElement("input", __assign({ type: type, className: clsxm("w-full m-0 block rounded px-2.5 py-1.5 text-md shadow-none bg-bg-50", "text-fg-800 placeholder:text-fg-300", "ring-0 focus:ring-0 outline-none focus:outline-none border-0", "ring-1 ring-fg-300 focus:ring-primary-500 focus:ring-2", "invalid:ring-red-700 invalid:focus:ring-red-700", "disabled:ring-fg-300 disabled:focus:ring-fg-300 disabled:ring-1", "disabled:bg-bg-100 disabled:cursor-default", className) }, registration, props)));
};

var Label = function (_a) {
    var _b = _a.id, id = _b === void 0 ? '' : _b, children = _a.children, _c = _a.className, className = _c === void 0 ? '' : _c, props = __rest(_a, ["id", "children", "className"]);
    return (React.createElement("label", __assign({ htmlFor: id, className: clsxm("w-full mb-2 text-md font-medium", "text-fg-700 dark:text-fg-200", className) }, props), children));
};

var tags = {
    h1: 'text-4xl sm:text-5xl font-semibold',
    h2: 'text-3xl sm:text-4xl font-semibold',
    h3: 'text-1xl sm:text-2xl font-semibold',
    h4: 'text-lg sm:text-xl font-semibold',
    h5: 'text-md sm:text-lg font-semibold',
    h6: 'text-base font-semibold',
    p: 'text-base',
    pre: 'text-base font-sans',
};
var variants = {
    default: 'text-fg-800 dark:text-fg-200',
    primary: 'text-primary-800 dark:text-primary-200',
    secondary: 'text-secondary-800 dark:text-secondary-200',
    warning: 'text-warning-800 dark:text-warning-200',
    danger: 'text-danger-800 dark:text-danger-200',
    success: 'text-success-800 dark:text-success-200',
};
var H1 = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("h1", __assign({ className: clsxm(tags.h1, variants[color], className) }, props), children));
};
var H2 = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("h2", __assign({ className: clsxm(tags.h2, variants[color], className) }, props), children));
};
var H3 = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("h3", __assign({ className: clsxm(tags.h3, variants[color], className) }, props), children));
};
var H4 = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("h4", __assign({ className: clsxm(tags.h4, variants[color], className) }, props), children));
};
var H5 = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("h5", __assign({ className: clsxm(tags.h5, variants[color], className) }, props), children));
};
var H6 = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("h6", __assign({ className: clsxm(tags.h6, variants[color], className) }, props), children));
};
var P = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("p", __assign({ className: clsxm(tags.p, variants[color], className) }, props), children));
};
var Pre = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, children = _a.children, _c = _a.color, color = _c === void 0 ? 'default' : _c, props = __rest(_a, ["className", "children", "color"]);
    return (React.createElement("pre", __assign({ className: clsxm(tags.pre, variants[color], className) }, props), children));
};

var Solid = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    return (React.createElement("div", { className: clsxm('absolute w-64 h-64 md:w-96 md:h-96 scale-105 opacity-60 dark:opacity-60 flex', className) },
        React.createElement("div", { className: "absolute top-1/2 left-1/2 w-2/5 h-2/5 rounded-md bg-primary-500 bg-opacity-20", style: { transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' } }),
        React.createElement("div", { className: "absolute top-1/2 left-1/2 w-3/5 h-3/5 rounded-md bg-primary-500 bg-opacity-20", style: { transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' } })));
};
var Outline = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b;
    return (React.createElement("div", { className: clsxm('absolute w-64 h-64 md:w-96 md:h-96 scale-105 opacity-60 dark:opacity-60 flex', className) },
        React.createElement("div", { className: "absolute top-1/2 left-1/2 w-1/5 h-1/5 rounded-md border-8 border-primary-500/20", style: { transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' } }),
        React.createElement("div", { className: "absolute top-1/2 left-1/2 w-2/5 h-2/5 rounded-md border-8 border-primary-500/20", style: { transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' } }),
        React.createElement("div", { className: "absolute top-1/2 left-1/2 w-3/5 h-3/5 rounded-md border-8 border-primary-500/20", style: { transform: 'translate3d(-50%, -50%, 0) rotate(45deg)' } })));
};
var Triangle = function (_a) {
    var _b = _a.className, className = _b === void 0 ? '' : _b, _c = _a.solid, solid = _c === void 0 ? false : _c;
    return solid ? React.createElement(Solid, { className: className }) : React.createElement(Outline, { className: className });
};

exports.Button = Button;
exports.Card = Card;
exports.Error = Error$1;
exports.H1 = H1;
exports.H2 = H2;
exports.H3 = H3;
exports.H4 = H4;
exports.H5 = H5;
exports.H6 = H6;
exports.Input = Input;
exports.Label = Label;
exports.Logo = Logo;
exports.NoiseBackground = NoiseBackground;
exports.P = P;
exports.Pre = Pre;
exports.Triangle = Triangle;
exports.clsxm = clsxm;
exports.getTheme = getTheme;
exports.safelist = safelist;
//# sourceMappingURL=index.js.map
