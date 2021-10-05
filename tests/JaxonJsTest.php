<?php
namespace Jaxon\Tests;

use Jaxon\JaxonJs;
use PHPUnit\Framework\TestCase;

/**
 * @covers Jaxon\Request
 */
final class JaxonJsTest extends TestCase
{
    public function testClassExists() 
    {
        $this->assertTrue(class_exists(JaxonJs::class));
    }

    public function testExists()
    {
        $this->assertDirectoryExists( JaxonJs::getSrcDist() );
        $this->assertFilesExists( JaxonJs::getDistFiles() );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_EN, true, true) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_EN, false) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_EN, false, true) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_BG) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_DE) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_ES) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_FR) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_NL) );
        $this->assertFilesExists( JaxonJs::getDistFiles(JaxonJs::LANG_TR) );
    }

    public function assertFilesExists(array $files) 
    {
        foreach($files as $file) {
            $this->assertFileExists($file);
        }
    }
}
