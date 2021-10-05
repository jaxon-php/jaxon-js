<?php

namespace Jaxon;

class JaxonJs {

	const LANG_BG = 'bg';
	const LANG_DE = 'de';
	const LANG_EN = 'en';
	const LANG_ES = 'es';
	const LANG_FR = 'fr';
	const LANG_NL = 'nl';
	const LANG_TR = 'tr';

	public static function getSrcDist() {
		return __DIR__ . '/../dist/';
	}

    public static function getDistFiles(string $lang=self::LANG_EN, bool $min=true, bool $includeDebug=false) {
		$srcDist = self::getSrcDist();
		$minFile = ($min ? '.min' : '');
		
		$files = [
			$srcDist . "jaxon.core{$minFile}.js",
			$srcDist . "lang/jaxon.{$lang}{$minFile}.js",
		];

		if($includeDebug) {
			$files[] = $srcDist . "jaxon.debug{$minFile}.js";
		}

		return $files;
	}
}
